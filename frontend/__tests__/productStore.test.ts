import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductStore } from '@/store/productStore';

describe('useProductStore', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useProductStore());
        act(() => {
            result.current.reset();
        });
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useProductStore());
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.selectedDate).toBeInstanceOf(Date);
    });

    it('updates selected date', () => {
        const { result } = renderHook(() => useProductStore());
        const newDate = new Date('2024-02-20');

        act(() => {
            result.current.setSelectedDate(newDate);
        });

        expect(result.current.selectedDate.getTime()).toBe(newDate.getTime());
    });

    it('updates date range', () => {
        const { result } = renderHook(() => useProductStore());
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        act(() => {
            result.current.setDateRange(startDate, endDate);
        });

        expect(result.current.startDate.getTime()).toBe(startDate.getTime());
        expect(result.current.endDate.getTime()).toBe(endDate.getTime());
    });

    it('updates loading state', () => {
        const { result } = renderHook(() => useProductStore());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('updates error state', () => {
        const { result } = renderHook(() => useProductStore());
        const errorMessage = 'Failed to fetch data';

        act(() => {
            result.current.setError(errorMessage);
        });

        expect(result.current.error).toBe(errorMessage);

        act(() => {
            result.current.setError(null);
        });

        expect(result.current.error).toBeNull();
    });

    it('updates filters', () => {
        const { result } = renderHook(() => useProductStore());

        act(() => {
            result.current.updateFilters({ searchTerm: 'product' });
        });

        expect(result.current.filters.searchTerm).toBe('product');
    });

    it('resets filters to initial state', () => {
        const { result } = renderHook(() => useProductStore());

        act(() => {
            result.current.updateFilters({ searchTerm: 'test' });
        });

        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.filters.searchTerm).toBe('');
    });

    it('resets entire store', () => {
        const { result } = renderHook(() => useProductStore());

        act(() => {
            result.current.setLoading(true);
            result.current.setError('error');
            result.current.updateFilters({ searchTerm: 'test' });
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.filters.searchTerm).toBe('');
    });
});
