import { Item, Player } from '../types';
import { parseCP } from './formatters';

const getEligiblePlayers = (item: Item, players: Player[]): Player[] =>
    players.filter(player =>
        player.isActive !== false
        && !(player.excludedItemIds ?? []).includes(item.id)
    );

export const getOriginalPlayerQueue = (
    item: Item,
    players: Player[],
    applyTop5Limit: boolean = true
): Player[] => {
    let queue = getEligiblePlayers(item, players)
        .sort((a, b) => parseCP(b.cp) - parseCP(a.cp));

    if (item.lastRecipientId && queue.length > 0) {
        const lastIndex = queue.findIndex(player => player.id === item.lastRecipientId);
        if (lastIndex !== -1) {
            const nextIndex = (lastIndex + 1) % queue.length;
            queue = [...queue.slice(nextIndex), ...queue.slice(0, nextIndex)];
        }
    }

    return item.limitToTop5 && applyTop5Limit ? queue.slice(0, 5) : queue;
};

export const getPlayerQueue = (item: Item, players: Player[], applyTop5Limit: boolean = true): Player[] => {
    if (!item.manualQueueEnabled) {
        return getOriginalPlayerQueue(item, players, applyTop5Limit);
    }

    const eligiblePlayers = getEligiblePlayers(item, players);

    const playersById = new Map(eligiblePlayers.map(player => [player.id, player]));
    const orderedPlayers: Player[] = [];

    for (const playerId of item.queuePlayerIds ?? []) {
        const player = playersById.get(playerId);
        if (player) {
            orderedPlayers.push(player);
            playersById.delete(playerId);
        }
    }

    const missingPlayers = [...playersById.values()]
        .sort((a, b) => parseCP(b.cp) - parseCP(a.cp));

    let sorted = item.queuePlayerIds
        ? [...orderedPlayers, ...missingPlayers]
        : [...missingPlayers];

    // 2. Filter Top 5 if item has limit enabled
    if (item.limitToTop5 && applyTop5Limit) {
        sorted = sorted.slice(0, 5);
    }

    // Legacy documents are rotated from their last recipient once. Persisted queues
    // already represent the next player at index zero.
    if (!item.queuePlayerIds) return getOriginalPlayerQueue(item, players, applyTop5Limit);

    return sorted;
};

export const getQueuePlayerIds = (item: Item, players: Player[]): string[] =>
    getPlayerQueue(item, players).map(player => player.id);

export const rotateQueueThroughPlayer = (queuePlayerIds: string[], playerId: string): string[] => {
    const playerIndex = queuePlayerIds.indexOf(playerId);
    if (playerIndex === -1) return queuePlayerIds;

    return [
        ...queuePlayerIds.slice(playerIndex + 1),
        ...queuePlayerIds.slice(0, playerIndex + 1)
    ];
};

export const movePlayerToQueueEnd = (queuePlayerIds: string[], playerId: string): string[] => {
    if (!queuePlayerIds.includes(playerId)) return queuePlayerIds;
    return [...queuePlayerIds.filter(id => id !== playerId), playerId];
};

export const getNewPlayerInsertionIndex = (
    queuePlayerIds: string[],
    appendToQueueEnd: boolean
): number => {
    return appendToQueueEnd ? queuePlayerIds.length : 0;
};
