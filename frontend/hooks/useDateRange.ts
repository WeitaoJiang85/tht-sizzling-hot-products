'use client';

import { useState, useCallback } from 'react';

/**
 * Hook for managing date range state
 * Handles single date and date range selections
 */
export const useDateRange = (initialDate: Date = new Date()) => {
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [startDate, setStartDate] = useState<Date>(
        new Date(initialDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    );
    const [endDate, setEndDate] = useState<Date>(initialDate);

    const updateDate = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const updateDateRange = useCallback((start: Date, end: Date) => {
        if (start <= end) {
            setStartDate(start);
            setEndDate(end);
        }
    }, []);

    const resetDateRange = useCallback(() => {
        setSelectedDate(initialDate);
        setStartDate(new Date(initialDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        setEndDate(initialDate);
    }, [initialDate]);

    return {
        selectedDate,
        startDate,
        endDate,
        updateDate,
        updateDateRange,
        resetDateRange,
    };
};
