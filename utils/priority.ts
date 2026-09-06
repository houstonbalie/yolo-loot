import { Item, Player } from '../types';
import { parseCP } from './formatters';

export const getPlayerQueue = (item: Item, players: Player[]): Player[] => {
    const eligiblePlayers = players.filter(player =>
        !(player.excludedItemIds ?? []).includes(item.id)
    );

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
    if (item.limitToTop5) {
        sorted = sorted.slice(0, 5);
    }

    // Legacy documents are rotated from their last recipient once. Persisted queues
    // already represent the next player at index zero.
    if (!item.queuePlayerIds && item.lastRecipientId) {
        const lastIndex = sorted.findIndex(p => p.id === item.lastRecipientId);
        if (lastIndex !== -1) {
            // "Next" person is index + 1
            // We rotate the array so the next eligible person is at index 0
            const nextStartIndex = (lastIndex + 1) % sorted.length;

            // If we are at the end, nextStartIndex is 0, so it's just the sorted list.
            if (nextStartIndex === 0) return sorted;

            const part1 = sorted.slice(nextStartIndex);
            const part2 = sorted.slice(0, nextStartIndex);
            return [...part1, ...part2];
        }
    }

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
    players: Player[],
    newPlayerCp: string,
    appendToQueueEnd: boolean
): number => {
    if (appendToQueueEnd) return queuePlayerIds.length;

    const playersById = new Map<string, Player>(players.map(player => [player.id, player]));
    const insertionIndex = queuePlayerIds.findIndex(id =>
        parseCP(playersById.get(id)?.cp ?? '0') < parseCP(newPlayerCp)
    );

    return insertionIndex === -1 ? queuePlayerIds.length : insertionIndex;
};
