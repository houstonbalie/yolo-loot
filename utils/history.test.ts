import { describe, expect, it } from 'vitest';
import { LootEvent } from '../types';
import { getHistoryEventTime, sortHistoryNewestFirst } from './history';

const event = (id: string, date: string): LootEvent => ({
    id,
    itemId: 'item',
    playerId: 'player',
    status: 'Acquired',
    date,
    raidName: 'Raid',
    cost: 0
});

describe('history ordering', () => {
    it('keeps ISO events in newest-first order', () => {
        expect(sortHistoryNewestFirst([
            event('old', '2026-09-01T10:00:00.000Z'),
            event('new', '2026-09-02T10:00:00.000Z')
        ]).map(({ id }) => id)).toEqual(['new', 'old']);
    });

    it('parses legacy Portuguese month abbreviations', () => {
        expect(getHistoryEventTime('24 Out, 20:30')).toBeGreaterThan(0);
    });
});
