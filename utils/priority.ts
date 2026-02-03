import { Item, Player } from '../types';
import { parseCP } from './formatters';

export const getPlayerQueue = (item: Item, players: Player[]): Player[] => {
    // 1. Sort by CP (Highest to Lowest)
    // 1. Sort by CP (Highest to Lowest)
    let sorted = [...players].sort((a, b) => parseCP(b.cp) - parseCP(a.cp));

    // 2. Filter Top 5 if item has limit enabled
    if (item.limitToTop5) {
        sorted = sorted.slice(0, 5);
    }

    // 2. Rotate if lastRecipientId exists
    if (item.lastRecipientId) {
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
