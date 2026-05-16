import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDateRange } from '@/hooks/useDateRange';

describe('useDateRange Hook', () => {
    it('initializes with default date', () => {
        const { result } = renderHook(() => useDateRange());
        expect(result.current.selectedDate).toBeInstanceOf(Date);
        expect(result.current.startDate).toBeInstanceOf(Date);
        expect(result.current.endDate).toBeInstanceOf(Date);
    });

    it('initializes with provided date', () => {
        const testDate = new Date('2024-01-15');
        const { result } = renderHook(() => useDateRange(testDate));
        expect(result.current.selectedDate.getTime()).toBe(testDate.getTime());
    });

    it('updates selected date', () => {
        const { result } = renderHook(() => useDateRange());
        const newDate = new Date('2024-02-20');

        act(() => {
            result.current.updateDate(newDate);
        });

        expect(result.current.selectedDate.getTime()).toBe(newDate.getTime());
    });

    it('updates date range', () => {
        const { result } = renderHook(() => useDateRange());
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        act(() => {
            result.current.updateDateRange(startDate, endDate);
        });

        expect(result.current.startDate.getTime()).toBe(startDate.getTime());
        expect(result.current.endDate.getTime()).toBe(endDate.getTime());
    });

    it('resets date range to initial state', () => {
        const initialDate = new Date('2024-01-15');
        const { result } = renderHook(() => useDateRange(initialDate));

        act(() => {
            result.current.updateDate(new Date('2024-02-20'));
        });

        act(() => {
            result.current.resetDateRange();
        });

        expect(result.current.selectedDate.getTime()).toBe(initialDate.getTime());
    });

    it('does not update range if start date is after end date', () => {
        const { result } = renderHook(() => useDateRange());
        const originalStart = result.current.startDate;
        const originalEnd = result.current.endDate;

        act(() => {
            result.current.updateDateRange(new Date('2024-12-31'), new Date('2024-01-01'));
        });

        expect(result.current.startDate.getTime()).toBe(originalStart.getTime());
        expect(result.current.endDate.getTime()).toBe(originalEnd.getTime());
    });
});
