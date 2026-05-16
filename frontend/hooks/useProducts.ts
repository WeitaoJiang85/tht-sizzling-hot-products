import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface DailyTopProduct {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    date: string;
    ranking: number;
}

export interface Product {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    rating: number;
}

/**
 * Hook for fetching products from the API
 * Uses React Query for data fetching, caching, and synchronization
 */
export const useProducts = (
    date?: Date,
    startDate?: Date,
    endDate?: Date
): UseQueryResult<Product[], Error> => {
    const queryKey = ['products', date?.toISOString(), startDate?.toISOString(), endDate?.toISOString()];

    return useQuery({
        queryKey,
        queryFn: async () => {
            // TODO: Implement API call to fetch products
            // Example: return apiClient.get('/products', { params: { date, startDate, endDate } });
            const response = await apiClient.get('/api/products', {
                params: {
                    date: date?.toISOString().split('T')[0],
                    startDate: startDate?.toISOString().split('T')[0],
                    endDate: endDate?.toISOString().split('T')[0],
                },
            });
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Hook for fetching daily top products
 */
export const useDailyTopProducts = (
    date?: Date
): UseQueryResult<DailyTopProduct[], Error> => {
    const queryKey = ['daily-top-products', date?.toISOString()];

    return useQuery({
        queryKey,
        queryFn: async () => {
            // TODO: Implement API call to fetch daily top products
            const response = await apiClient.get('/api/products/daily-top', {
                params: {
                    date: date?.toISOString().split('T')[0],
                },
            });
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 3,
    });
};
