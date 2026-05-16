/**
 * Utility functions for common operations
 */

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
    return date.toLocaleString();
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const isValidDate = (date: Date): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
};

export const getDaysSince = (date: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const getDateRange = (days: number): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { start, end };
};

export const clsx = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
};
