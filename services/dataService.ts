import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Item, LootEvent } from '../types';
import { sortHistoryNewestFirst } from '../utils/history';

// Collection References
const PLAYERS_COLLECTION = 'players';
const ITEMS_COLLECTION = 'items';
const HISTORY_COLLECTION = 'history';

// --- PLAYERS SERVICE ---

export const subscribeToPlayers = (callback: (players: Player[]) => void) => {
    const q = query(collection(db, PLAYERS_COLLECTION), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const players = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Player));
        callback(players);
    });
};

export const addPlayer = async (player: Omit<Player, 'id'>) => {
    return await addDoc(collection(db, PLAYERS_COLLECTION), player);
};

export const addPlayerWithQueues = async (
    player: Omit<Player, 'id'>,
    itemQueues: Array<{ itemId: string; queuePlayerIds: string[]; insertionIndex: number }>
) => {
    const batch = writeBatch(db);
    const playerRef = doc(collection(db, PLAYERS_COLLECTION));
    batch.set(playerRef, player);

    for (const { itemId, queuePlayerIds, insertionIndex } of itemQueues) {
        const uniqueIds = queuePlayerIds.filter(id => id !== playerRef.id);
        const safeIndex = Math.max(0, Math.min(insertionIndex, uniqueIds.length));
        batch.update(doc(db, ITEMS_COLLECTION, itemId), {
            queuePlayerIds: [
                ...uniqueIds.slice(0, safeIndex),
                playerRef.id,
                ...uniqueIds.slice(safeIndex)
            ]
        });
    }

    await batch.commit();
    return playerRef;
};

export const deletePlayer = async (id: string) => {
    return await deleteDoc(doc(db, PLAYERS_COLLECTION, id));
};

export const updatePlayer = async (id: string, data: Partial<Player>) => {
    return await updateDoc(doc(db, PLAYERS_COLLECTION, id), data);
};


// --- ITEMS SERVICE ---

export const subscribeToItems = (callback: (items: Item[]) => void) => {
    const q = query(collection(db, ITEMS_COLLECTION), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Item));
        callback(items);
    });
};

export const addItem = async (item: Omit<Item, 'id'>) => {
    return await addDoc(collection(db, ITEMS_COLLECTION), item);
};

export const updateItem = async (id: string, data: Partial<Item>) => {
    return await updateDoc(doc(db, ITEMS_COLLECTION, id), data);
};

export const deleteItem = async (id: string) => {
    return await deleteDoc(doc(db, ITEMS_COLLECTION, id));
};


// --- HISTORY SERVICE ---

export const subscribeToHistory = (callback: (history: LootEvent[]) => void) => {
    const q = collection(db, HISTORY_COLLECTION);
    return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LootEvent));
        callback(sortHistoryNewestFirst(history));
    });
};

export const addLootEvent = async (event: Omit<LootEvent, 'id'>) => {
    return await addDoc(collection(db, HISTORY_COLLECTION), event);
};

export const commitDistribution = async ({
    events,
    itemId,
    queuePlayerIds,
    lastRecipientId,
    playerUpdate
}: {
    events: Array<Omit<LootEvent, 'id'>>;
    itemId: string;
    queuePlayerIds: string[];
    lastRecipientId?: string;
    playerUpdate?: { playerId: string; data: Partial<Player> };
}) => {
    const batch = writeBatch(db);

    for (const event of events) {
        batch.set(doc(collection(db, HISTORY_COLLECTION)), event);
    }

    const itemData: Partial<Item> = { queuePlayerIds };
    if (lastRecipientId) itemData.lastRecipientId = lastRecipientId;
    batch.update(doc(db, ITEMS_COLLECTION, itemId), itemData);

    if (playerUpdate) {
        batch.update(doc(db, PLAYERS_COLLECTION, playerUpdate.playerId), playerUpdate.data);
    }

    await batch.commit();
};

export const deleteLootEvent = async (id: string) => {
    return await deleteDoc(doc(db, HISTORY_COLLECTION, id));
};
