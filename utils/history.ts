import { LootEvent } from '../types';

const monthIndexes: Record<string, number> = {
    jan: 0, feb: 1, fev: 1, mar: 2, apr: 3, abr: 3, may: 4, mai: 4,
    jun: 5, jul: 6, aug: 7, ago: 7, sep: 8, set: 8, oct: 9, out: 9,
    nov: 10, dec: 11, dez: 11
};

export const getHistoryEventTime = (value: unknown): number => {
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().getTime();
    }

    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;

    const legacy = value.match(/^(\d{1,2})\s+([a-zà-ÿ]{3,}),?\s+(\d{1,2}):(\d{2})(?:\s+(\d{4}))?$/i);
    if (!legacy) return 0;

    const [, dayText, monthText, hourText, minuteText, yearText] = legacy;
    const month = monthIndexes[monthText.toLowerCase().slice(0, 3)];
    if (month === undefined) return 0;

    const now = new Date();
    let year = yearText ? Number(yearText) : now.getFullYear();
    let result = new Date(year, month, Number(dayText), Number(hourText), Number(minuteText));
    if (!yearText && result.getTime() > now.getTime()) {
        year -= 1;
        result = new Date(year, month, Number(dayText), Number(hourText), Number(minuteText));
    }
    return result.getTime();
};

export const sortHistoryNewestFirst = (history: LootEvent[]): LootEvent[] =>
    [...history].sort((a, b) => getHistoryEventTime(b.date) - getHistoryEventTime(a.date));
