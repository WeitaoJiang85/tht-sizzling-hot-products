import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useDailyTopProducts } from '@/hooks/useProducts';
import * as apiModule from '@/services/api';

vi.mock('@/services/api', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

const TestComponentWithUseProducts = ({ date, startDate, endDate }: any) => {
    const { data, isPending, isError, error } = useProducts(date, startDate, endDate);

    if (isPending) return <div>Loading </div>;
    if (isError) return <div>Error: { (error as any)?.message } </div>;
    return <div>{ JSON.stringify(data) } </div>;
};

const TestComponentWithUseDailyTopProducts = ({ date }: any) => {
    const { data, isPending, isError, error } = useDailyTopProducts(date);

    if (isPending) return <div>Loading </div>;
    if (isError) return <div>Error: { (error as any)?.message } </div>;
    return <div>{ JSON.stringify(data) } </div>;
};

const renderWithQueryClient = (component: any) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(React.createElement(QueryClientProvider, { client: queryClient }, component));
};

describe('useProducts Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches products successfully', async () => {
        const mockData = [
            { id: 'P1', name: 'Product 1', quantity: 10, revenue: 100, rating: 4.5 },
        ];

        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: mockData });

        const { container } = renderWithQueryClient(
            React.createElement(TestComponentWithUseProducts, {})
        );

        await waitFor(() => {
            expect(container.textContent).toContain('Product 1');
        });
    });

    it('calls API with correct endpoint', async () => {
        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: [] });

        renderWithQueryClient(React.createElement(TestComponentWithUseProducts, {}));

        await waitFor(() => {
            expect(apiModule.apiClient.get).toHaveBeenCalledWith(
                '/api/products',
                expect.objectContaining({
                    params: expect.any(Object),
                })
            );
        });
    });

    it('shows loading state initially', () => {
        (apiModule.apiClient.get as any).mockImplementationOnce(
            () => new Promise(() => { })
        );

        const { container } = renderWithQueryClient(
            React.createElement(TestComponentWithUseProducts, {})
        );

        expect(container.textContent).toContain('Loading');
    });

    it('includes date parameter when provided', async () => {
        const testDate = new Date('2026-04-23');
        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: [] });

        renderWithQueryClient(
            React.createElement(TestComponentWithUseProducts, { date: testDate })
        );

        await waitFor(() => {
            expect(apiModule.apiClient.get).toHaveBeenCalledWith(
                '/api/products',
                expect.objectContaining({
                    params: expect.objectContaining({
                        date: '2026-04-23',
                    }),
                })
            );
        });
    });
});

describe('useDailyTopProducts Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches daily top products successfully', async () => {
        const mockData = [
            {
                productId: 'P1',
                productName: 'Test Product',
                quantitySold: 5,
                revenue: 500,
                date: '2026-04-23',
                ranking: 1,
            },
        ];

        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: mockData });

        const { container } = renderWithQueryClient(
            React.createElement(TestComponentWithUseDailyTopProducts, {})
        );

        await waitFor(() => {
            expect(container.textContent).toContain('Test Product');
        });
    });

    it('calls API with correct endpoint', async () => {
        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: [] });

        renderWithQueryClient(React.createElement(TestComponentWithUseDailyTopProducts, {}));

        await waitFor(() => {
            expect(apiModule.apiClient.get).toHaveBeenCalledWith(
                '/api/products/daily-top',
                expect.objectContaining({
                    params: expect.any(Object),
                })
            );
        });
    });

    it('includes date parameter when provided', async () => {
        const testDate = new Date('2026-04-23');
        (apiModule.apiClient.get as any).mockResolvedValueOnce({ data: [] });

        renderWithQueryClient(
            React.createElement(TestComponentWithUseDailyTopProducts, { date: testDate })
        );

        await waitFor(() => {
            expect(apiModule.apiClient.get).toHaveBeenCalledWith(
                '/api/products/daily-top',
                expect.objectContaining({
                    params: expect.objectContaining({
                        date: '2026-04-23',
                    }),
                })
            );
        });
    });

    it('shows loading state initially', () => {
        (apiModule.apiClient.get as any).mockImplementationOnce(
            () => new Promise(() => { })
        );

        const { container } = renderWithQueryClient(
            React.createElement(TestComponentWithUseDailyTopProducts, {})
        );

        expect(container.textContent).toContain('Loading');
    });
});
