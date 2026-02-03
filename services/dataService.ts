import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Item, LootEvent } from '../types';

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
    // Ordered by most recent first
    const q = query(collection(db, HISTORY_COLLECTION), orderBy('date', 'desc')); // Note: Date string sorting might be tricky if not ISO, but sticking to simple string for now as per types
    return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LootEvent));
        callback(history);
    });
};

export const addLootEvent = async (event: Omit<LootEvent, 'id'>) => {
    return await addDoc(collection(db, HISTORY_COLLECTION), event);
};

export const deleteLootEvent = async (id: string) => {
    return await deleteDoc(doc(db, HISTORY_COLLECTION, id));
};
