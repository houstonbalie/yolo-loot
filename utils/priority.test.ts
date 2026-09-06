import { describe, expect, it } from 'vitest';
import { Item, Player } from '../types';
import { getNewPlayerInsertionIndex, getPlayerQueue, movePlayerToQueueEnd, rotateQueueThroughPlayer } from './priority';

const player = (id: string, cp: string, excludedItemIds: string[] = []): Player => ({
    id,
    name: id,
    class: 'Elf',
    cp,
    dkp: 0,
    role: 'DPS',
    avatarUrl: '',
    status: 'Online',
    excludedItemIds
});

const item = (data: Partial<Item> = {}): Item => ({
    id: 'item-1',
    name: 'Test item',
    rarity: 'Rare',
    stats: '',
    chance: '',
    iconUrl: '',
    cost: 50,
    ...data
});

const players = [player('low', '1K'), player('high', '3K'), player('mid', '2K')];

describe('persistent item queues', () => {
    it('initializes legacy items by CP', () => {
        expect(getPlayerQueue(item(), players).map(({ id }) => id))
            .toEqual(['high', 'mid', 'low']);
    });

    it('rotates legacy items after their last recipient', () => {
        expect(getPlayerQueue(item({ lastRecipientId: 'mid' }), players).map(({ id }) => id))
            .toEqual(['low', 'high', 'mid']);
    });

    it('preserves a persisted order, ignores stale IDs and appends missing players', () => {
        expect(getPlayerQueue(item({ queuePlayerIds: ['mid', 'deleted', 'high', 'mid'] }), players).map(({ id }) => id))
            .toEqual(['mid', 'high', 'low']);
    });

    it('filters a player only from excluded items', () => {
        const excluded = player('excluded', '9K', ['item-1']);
        expect(getPlayerQueue(item(), [...players, excluded]).map(({ id }) => id))
            .not.toContain('excluded');
        expect(getPlayerQueue(item({ id: 'item-2' }), [...players, excluded]).map(({ id }) => id)[0])
            .toBe('excluded');
    });

    it('moves only a manually skipped player to the end', () => {
        expect(movePlayerToQueueEnd(['high', 'mid', 'low'], 'high'))
            .toEqual(['mid', 'low', 'high']);
    });

    it('allows a skipped player again after a complete turn', () => {
        let queue = ['high', 'mid', 'low'];
        queue = movePlayerToQueueEnd(queue, 'high');
        queue = movePlayerToQueueEnd(queue, 'mid');
        queue = movePlayerToQueueEnd(queue, 'low');
        expect(queue).toEqual(['high', 'mid', 'low']);
    });

    it('rotates the winner and every automatically skipped predecessor', () => {
        expect(rotateQueueThroughPlayer(['high', 'mid', 'low'], 'mid'))
            .toEqual(['low', 'high', 'mid']);
    });

    it('keeps a newly appended player at the visible end', () => {
        const currentQueue = getPlayerQueue(item({ queuePlayerIds: ['mid', 'low', 'high'] }), players)
            .map(({ id }) => id);
        expect(getNewPlayerInsertionIndex(currentQueue, players, '9K', true)).toBe(3);
    });

    it('inserts by CP when appending to the end is disabled', () => {
        expect(getNewPlayerInsertionIndex(['mid', 'low', 'high'], players, '2.5K', false)).toBe(0);
        expect(getNewPlayerInsertionIndex(['low', 'high', 'mid'], players, '1.5K', false)).toBe(0);
    });
});
