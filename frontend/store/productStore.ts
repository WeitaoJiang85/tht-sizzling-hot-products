'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ProductStoreState {
    // State
    selectedDate: Date;
    startDate: Date;
    endDate: Date;
    isLoading: boolean;
    error: string | null;
    filters: {
        searchTerm: string;
        minRevenue: number;
        maxRevenue: number;
        sortBy: 'name' | 'revenue' | 'quantity';
        sortOrder: 'asc' | 'desc';
    };

    // Actions
    setSelectedDate: (date: Date) => void;
    setDateRange: (startDate: Date, endDate: Date) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    updateFilters: (filters: Partial<ProductStoreState['filters']>) => void;
    resetFilters: () => void;
    reset: () => void;
}

const initialState = {
    selectedDate: new Date(),
    startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    isLoading: false,
    error: null,
    filters: {
        searchTerm: '',
        minRevenue: 0,
        maxRevenue: 100000,
        sortBy: 'revenue' as const,
        sortOrder: 'desc' as const,
    },
};

export const useProductStore = create<ProductStoreState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setSelectedDate: (date: Date) =>
                    set({ selectedDate: date }, false, 'setSelectedDate'),

                setDateRange: (startDate: Date, endDate: Date) =>
                    set({ startDate, endDate }, false, 'setDateRange'),

                setLoading: (isLoading: boolean) =>
                    set({ isLoading }, false, 'setLoading'),

                setError: (error: string | null) =>
                    set({ error }, false, 'setError'),

                updateFilters: (filters: Partial<ProductStoreState['filters']>) =>
                    set(
                        (state) => ({
                            filters: {
                                ...state.filters,
                                ...filters,
                            },
                        }),
                        false,
                        'updateFilters'
                    ),

                resetFilters: () =>
                    set({ filters: initialState.filters }, false, 'resetFilters'),

                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: 'product-store',
                partialize: (state) => ({
                    filters: state.filters,
                    selectedDate: state.selectedDate,
                    startDate: state.startDate,
                    endDate: state.endDate,
                }),
            }
        ),
        { name: 'ProductStore' }
    )
);
