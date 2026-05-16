import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '@/components/Dashboard';

vi.mock('@/services/api', () => ({
    apiService: {
        getDataRange: vi.fn().mockResolvedValue({
            minDate: '2026-04-21',
            maxDate: '2026-04-23',
        }),
        getTopProductLatestWindow: vi.fn().mockResolvedValue({
            productId: 'P1',
            productName: 'Ezy Storage 37L Flexi Laundry Basket - White',
            quantitySold: 5,
            date: '2026-04-21',
        }),
        getDailyTopProducts: vi.fn().mockResolvedValue([
            {
                productId: 'P1',
                productName: 'Ezy Storage 37L Flexi Laundry Basket - White',
                quantitySold: 3,
                date: '2026-04-23',
            },
        ]),
        getProducts: vi.fn().mockResolvedValue([
            { id: 'P1', name: 'Ezy Storage 37L Flexi Laundry Basket - White', quantity: 6 },
            { id: 'P4', name: 'Ozito 80W Soldering Iron', quantity: 3 },
        ]),
    },
}));

const renderDashboard = (props: React.ComponentProps<typeof Dashboard> = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <Dashboard {...props} />
        </QueryClientProvider>
    );
};

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dashboard hero text', () => {
        renderDashboard();
        expect(screen.getByText('Sizzling Hot Products')).toBeInTheDocument();
        expect(screen.getByText('Find the hottest picks for everyday projects')).toBeInTheDocument();
    });

    it('renders date selector section', async () => {
        renderDashboard();
        expect(await screen.findByText('Single-Day Hottest Product')).toBeInTheDocument();
        expect(screen.getByText('Selected Date')).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Query Single Day' })).toBeInTheDocument();
    });

    it('displays loading spinner when isLoading is true', () => {
        renderDashboard({ isLoading: true });
        expect(screen.getByText('Preparing your product highlights...')).toBeInTheDocument();
    });

    it('displays error alert when error is provided', () => {
        const errorMessage = 'Failed to load data';
        renderDashboard({ error: errorMessage });
        expect(screen.getByText('Failed to load the latest products')).toBeInTheDocument();
    });

    it('calls onError when dismiss button is clicked', () => {
        const onError = vi.fn();
        renderDashboard({ error: 'Test error', onError });

        const dismissButton = screen.getByLabelText('Dismiss error');
        fireEvent.click(dismissButton);

        expect(onError).toHaveBeenCalledWith(null);
    });
});
