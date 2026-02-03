import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Player, Item, LootEvent, DistributableItem, LootStatus } from '../types';
import {
  subscribeToPlayers,
  subscribeToItems,
  subscribeToHistory,
  addPlayer,
  addItem,
  addLootEvent,
  updatePlayer,
  deletePlayer,
  deleteItem,
  updateItem,
  deleteLootEvent
} from '../services/dataService';

interface GameContextType {
  players: Player[];
  items: Item[];
  lootHistory: LootEvent[];
  distributionQueue: DistributableItem[];
  addPlayer: (player: Omit<Player, 'id' | 'dkp' | 'avatarUrl' | 'status'>) => void;
  addItem: (item: Omit<Item, 'id'>) => void;
  deletePlayer: (id: string) => Promise<void>;
  updatePlayer: (id: string, data: Partial<Player>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  addToDistributionQueue: (itemName: string, quantity: number) => void;
  removeFromDistributionQueue: (id: string) => void;
  distributeItem: (playerId: string, item: DistributableItem, status: LootStatus, consumeItem?: boolean) => void;
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

  const handleAddPlayer = async (newPlayerData: Omit<Player, 'id' | 'dkp' | 'avatarUrl' | 'status'>) => {
    const newPlayer: Omit<Player, 'id'> = {
      ...newPlayerData,
      dkp: 0,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPlayerData.name}`,
      status: 'Online'
    };
    await addPlayer(newPlayer);
  };

  const handleAddItem = async (newItemData: Omit<Item, 'id'>) => {
    await addItem(newItemData);
  };

  const addToDistributionQueue = (itemName: string, quantity: number) => {
    setDistributionQueue(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: itemName,
      quantity
    }]);
  };

  const removeFromDistributionQueue = (id: string) => {
    setDistributionQueue(prev => prev.filter(item => item.id !== id));
  };

  const distributeItem = async (playerId: string, distItem: DistributableItem, status: LootStatus, consumeItem: boolean = true) => {
    // Determine cost based on a mock logic or default
    const cost = status === 'Conquistado' ? 50 : 0;

    // Find a matching full item definition if it exists for icons etc, or create generic
    // Note: We use the local 'items' state which is synced with Firebase
    const fullItem = items.find(i => i.name.toLowerCase().includes(distItem.name.toLowerCase())) || items[0] || { id: 'unknown', name: distItem.name, iconUrl: '', rarity: 'Comum' };

    const newEvent: Omit<LootEvent, 'id'> = {
      itemId: fullItem.id,
      playerId,
      status: status,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      raidName: 'Raid Manual',
      cost
    };

    await addLootEvent(newEvent);

    if (status === 'Conquistado') {
      const player = players.find(p => p.id === playerId);
      if (player) {
        const newDkp = Math.max(0, player.dkp - cost);
        await updatePlayer(playerId, { dkp: newDkp });
      }
      // Update item with the last recipient ID
      await updateItem(fullItem.id, { lastRecipientId: playerId });
    }

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
      deleteItem: async (id) => await deleteItem(id),
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