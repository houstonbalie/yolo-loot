import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Player, Item, LootEvent, DistributableItem, LootStatus, NewPlayer } from '../types';
import {
  subscribeToPlayers,
  subscribeToItems,
  subscribeToHistory,
  addPlayerWithQueues,
  addItem,
  updatePlayer,
  deletePlayer,
  deleteItem,
  updateItem,
  deleteLootEvent,
  commitDistribution
} from '../services/dataService';
import { getNewPlayerInsertionIndex, getQueuePlayerIds, movePlayerToQueueEnd, rotateQueueThroughPlayer } from '../utils/priority';
import { parseCP } from '../utils/formatters';

interface GameContextType {
  players: Player[];
  items: Item[];
  lootHistory: LootEvent[];
  distributionQueue: DistributableItem[];
  addPlayer: (player: NewPlayer, appendToQueueEnd?: boolean) => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => void;
  deletePlayer: (id: string) => Promise<void>;
  updatePlayer: (id: string, data: Partial<Player>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  addToDistributionQueue: (item: Item, quantity: number) => void;
  removeFromDistributionQueue: (id: string) => void;
  distributeItem: (playerId: string, item: DistributableItem, status: LootStatus, consumeItem?: boolean) => Promise<void>;
  clearPlayers: () => Promise<void>;
  clearItems: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [lootHistory, setLootHistory] = useState<LootEvent[]>([]);
  const [distributionQueue, setDistributionQueue] = useState<DistributableItem[]>([]);

  // Subscribe to Firebase data
  useEffect(() => {
    const unsubPlayers = subscribeToPlayers(setPlayers);
    const unsubItems = subscribeToItems(setItems);
    const unsubHistory = subscribeToHistory(setLootHistory);

    return () => {
      unsubPlayers();
      unsubItems();
      unsubHistory();
    };
  }, []);

  const handleAddPlayer = async (newPlayerData: NewPlayer, appendToQueueEnd: boolean = true) => {
    const newPlayer: Omit<Player, 'id'> = {
      ...newPlayerData,
      dkp: 0,
      avatarUrl: newPlayerData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPlayerData.name}`,
      status: 'Online'
    };

    const itemQueues = items
      .filter(item => !(newPlayer.excludedItemIds ?? []).includes(item.id))
      .map(item => {
        const queuePlayerIds = getQueuePlayerIds(item, players);
        const insertionIndex = getNewPlayerInsertionIndex(
          queuePlayerIds,
          players,
          newPlayer.cp,
          appendToQueueEnd
        );
        return { itemId: item.id, queuePlayerIds, insertionIndex };
      });

    await addPlayerWithQueues(newPlayer, itemQueues);
  };

  const handleAddItem = async (newItemData: Omit<Item, 'id'>) => {
    const queuePlayerIds = [...players]
      .sort((a, b) => parseCP(b.cp) - parseCP(a.cp))
      .map(player => player.id);
    await addItem({ ...newItemData, queuePlayerIds });
  };

  const addToDistributionQueue = (item: Item, quantity: number) => {
    setDistributionQueue(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      name: item.name,
      quantity
    }]);
  };

  const removeFromDistributionQueue = (id: string) => {
    setDistributionQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    setDistributionQueue(queue => queue.filter(item => item.itemId !== id));
  };

  const distributeItem = async (playerId: string, distItem: DistributableItem, status: LootStatus, consumeItem: boolean = true) => {
    // Determine cost based on a mock logic or default
    const fullItem = items.find(i => i.id === distItem.itemId);
    if (!fullItem) throw new Error(`Item not found: ${distItem.name}`);
    const cost = status === 'Acquired' ? fullItem.cost : 0;

    const currentQueue = getQueuePlayerIds(fullItem, players);
    const playerIndex = currentQueue.indexOf(playerId);
    if (playerIndex === -1) throw new Error('Player is not eligible for this item.');

    const processedPlayerIds = status === 'Acquired'
      ? currentQueue.slice(0, playerIndex + 1)
      : [playerId];
    const eventDate = new Date().toISOString();
    const events: Array<Omit<LootEvent, 'id'>> = processedPlayerIds.map(processedPlayerId => ({
      itemId: fullItem.id,
      playerId: processedPlayerId,
      status: processedPlayerId === playerId ? status : 'Skipped',
      date: eventDate,
      raidName: 'Raid Manual',
      cost: processedPlayerId === playerId ? cost : 0
    }));

    const queuePlayerIds = status === 'Acquired'
      ? rotateQueueThroughPlayer(currentQueue, playerId)
      : movePlayerToQueueEnd(currentQueue, playerId);
    const player = players.find(candidate => candidate.id === playerId);

    await commitDistribution({
      events,
      itemId: fullItem.id,
      queuePlayerIds,
      lastRecipientId: status === 'Acquired' ? playerId : undefined,
      playerUpdate: status === 'Acquired' && player
        ? { playerId, data: { dkp: Math.max(0, player.dkp - cost) } }
        : undefined
    });

    setItems(currentItems => currentItems.map(item =>
      item.id === fullItem.id
        ? {
            ...item,
            queuePlayerIds,
            ...(status === 'Acquired' ? { lastRecipientId: playerId } : {})
          }
        : item
    ));

    // Only decrement quantity or remove from queue if consumeItem is true
    if (consumeItem) {
      if (distItem.quantity > 1) {
        setDistributionQueue(queue => queue.map(i =>
          i.id === distItem.id ? { ...i, quantity: i.quantity - 1 } : i
        ));
      } else {
        removeFromDistributionQueue(distItem.id);
      }
    }
  };

  return (
    <GameContext.Provider value={{
      players,
      items,
      lootHistory,
      distributionQueue,
      addPlayer: handleAddPlayer,
      addItem: handleAddItem,
      addToDistributionQueue,
      removeFromDistributionQueue,
      distributeItem,
      deletePlayer: async (id) => await deletePlayer(id),
      updatePlayer: async (id, data) => await updatePlayer(id, data),
      deleteItem: handleDeleteItem,
      updateItem: async (id, data) => await updateItem(id, data),
      clearPlayers: async () => {
        const promises = players.map(p => deletePlayer(p.id));
        await Promise.all(promises);
      },
      clearItems: async () => {
        const promises = items.map(i => deleteItem(i.id));
        await Promise.all(promises);
      },
      clearHistory: async () => {
        const promises = lootHistory.map(h => deleteLootEvent(h.id));
        await Promise.all(promises);
      }
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
