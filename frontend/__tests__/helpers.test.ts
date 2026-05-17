import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
    isValidDate,
    getDaysSince,
    getDateRange,
    clsx,
} from '@/utils/helpers';

describe('Helper Utilities', () => {
    describe('formatDate', () => {
        it('formats date to YYYY-MM-DD format', () => {
            const date = new Date('2026-04-23T10:30:00Z');
            expect(formatDate(date)).toBe('2026-04-23');
        });

        it('handles dates with different times', () => {
            const date = new Date('2026-04-23T23:59:59Z');
            expect(formatDate(date)).toBe('2026-04-23');
        });

        it('pads single digit months and days', () => {
            const date = new Date('2026-01-05T00:00:00Z');
            expect(formatDate(date)).toBe('2026-01-05');
        });
    });

    describe('formatDateTime', () => {
        it('formats date and time in locale string', () => {
            const date = new Date('2026-04-23T10:30:00Z');
            const result = formatDateTime(date);

            expect(result).toContain('2026');
            expect(result).toContain('4');
            expect(result).toContain('23');
        });

        it('includes time component', () => {
            const date = new Date('2026-04-23T14:30:00Z');
            const result = formatDateTime(date);

            expect(result.length).toBeGreaterThan(10);
        });
    });

    describe('formatCurrency', () => {
        it('formats numbers as USD currency', () => {
            expect(formatCurrency(100)).toBe('$100.00');
        });

        it('handles decimal amounts', () => {
            expect(formatCurrency(99.99)).toBe('$99.99');
        });

        it('formats large numbers with commas', () => {
            const result = formatCurrency(1000.5);
            expect(result).toContain('$1,000.50');
        });

        it('handles zero', () => {
            expect(formatCurrency(0)).toBe('$0.00');
        });

        it('handles negative amounts', () => {
            expect(formatCurrency(-50)).toBe('-$50.00');
        });
    });

    describe('formatNumber', () => {
        it('formats number with default decimals', () => {
            expect(formatNumber(1000)).toBe('1,000');
        });

        it('formats number with specified decimals', () => {
            expect(formatNumber(99.456, 2)).toBe('99.46');
        });

        it('formats large numbers with commas', () => {
            expect(formatNumber(1000000, 0)).toBe('1,000,000');
        });

        it('handles zero decimals', () => {
            expect(formatNumber(3.14159, 0)).toBe('3');
        });

        it('handles multiple decimal places', () => {
            expect(formatNumber(3.14159, 3)).toBe('3.142');
        });
    });

    describe('isValidDate', () => {
        it('returns true for valid dates', () => {
            expect(isValidDate(new Date())).toBe(true);
            expect(isValidDate(new Date('2026-04-23'))).toBe(true);
        });

        it('returns false for invalid dates', () => {
            expect(isValidDate(new Date('invalid'))).toBe(false);
        });

        it('returns false for non-date objects', () => {
            expect(isValidDate('2026-04-23' as any)).toBe(false);
            expect(isValidDate(null as any)).toBe(false);
            expect(isValidDate(undefined as any)).toBe(false);
        });
    });

    describe('getDaysSince', () => {
        it('returns 0 for today', () => {
            const today = new Date();
            // Allow 1 day margin for time zone differences
            const daysSince = getDaysSince(today);
            expect(daysSince).toBeLessThanOrEqual(1);
        });

        it('returns correct days for past dates', () => {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

            const daysSince = getDaysSince(fiveDaysAgo);
            expect(daysSince).toBeGreaterThanOrEqual(4);
            expect(daysSince).toBeLessThanOrEqual(6);
        });

        it('returns correct days for future dates', () => {
            const fiveDaysFromNow = new Date();
            fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

            const daysSince = getDaysSince(fiveDaysFromNow);
            expect(daysSince).toBeGreaterThanOrEqual(4);
            expect(daysSince).toBeLessThanOrEqual(6);
        });
    });

    describe('getDateRange', () => {
        it('returns date range for specified days', () => {
            const { start, end } = getDateRange(7);

            expect(start instanceof Date).toBe(true);
            expect(end instanceof Date).toBe(true);
            expect(end.getTime()).toBeGreaterThan(start.getTime());
        });

        it('calculates correct day difference', () => {
            const { start, end } = getDateRange(10);

            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            expect(diffDays).toBe(10);
        });

        it('returns end date as today or close to today', () => {
            const { end } = getDateRange(5);
            const today = new Date();

            // Allow 1 second margin
            expect(Math.abs(end.getTime() - today.getTime())).toBeLessThan(1000);
        });

        it('handles zero days', () => {
            const { start, end } = getDateRange(0);

            // Start and end should be nearly the same (within seconds)
            expect(Math.abs(end.getTime() - start.getTime())).toBeLessThan(1000);
        });
    });

    describe('clsx', () => {
        it('joins class names', () => {
            expect(clsx('btn', 'btn-primary')).toBe('btn btn-primary');
        });

        it('filters out falsy values', () => {
            expect(clsx('btn', null, 'btn-primary', undefined, false)).toBe('btn btn-primary');
        });

        it('handles empty strings', () => {
            expect(clsx('btn', '', 'btn-primary')).toBe('btn btn-primary');
        });

        it('handles all falsy values', () => {
            expect(clsx(null, undefined, false, '')).toBe('');
        });

        it('handles single class', () => {
            expect(clsx('btn')).toBe('btn');
        });

        it('handles no arguments', () => {
            expect(clsx()).toBe('');
        });

        it('preserves order', () => {
            expect(clsx('z', 'a', 'm')).toBe('z a m');
        });
    });
});
