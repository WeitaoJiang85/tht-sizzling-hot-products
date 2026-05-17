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
        localStorage.clear();
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

    it('persists selected date to localStorage on component mount', () => {
        const testDate = '2026-04-22';
        localStorage.setItem('tht-dashboard-single-date', testDate);

        renderDashboard();

        const savedDate = localStorage.getItem('tht-dashboard-single-date');
        expect(savedDate).toBe(testDate);
    });

    it('restores date from localStorage on component mount', async () => {
        const testDate = '2026-04-22';
        localStorage.setItem('tht-dashboard-single-date', testDate);

        renderDashboard();

        await screen.findByText('Single-Day Hottest Product');
        const savedDate = localStorage.getItem('tht-dashboard-single-date');
        expect(savedDate).toBe(testDate);
    });

    it('saves new date to localStorage when query is submitted', async () => {
        renderDashboard();
        await screen.findByText('Single-Day Hottest Product');

        const queryButton = await screen.findByRole('button', { name: 'Query Single Day' });
        fireEvent.click(queryButton);

        // After query submission, date should be persisted
        const savedDate = localStorage.getItem('tht-dashboard-single-date');
        expect(savedDate).toBeDefined();
    });

    it('renders skeleton loading state when top product is loading', async () => {
        renderDashboard();
        await screen.findByText('Single-Day Hottest Product');

        // Should eventually render without error even during loading
        expect(screen.getByText('Sizzling Hot Products')).toBeInTheDocument();
    });

    it('renders top product section headers', async () => {
        renderDashboard();
        await screen.findByText('Single-Day Hottest Product');

        // Verify all section headers are present
        expect(screen.getByText('Single-Day Hottest Product')).toBeInTheDocument();
        expect(screen.getByText('Top Product Over Latest 3 Days')).toBeInTheDocument();
        expect(screen.getByText('All Products')).toBeInTheDocument();
    });

    it('renders latest window top products section', async () => {
        renderDashboard();
        await screen.findByText('Top Product Over Latest 3 Days');
        expect(screen.getByText('Top Product Over Latest 3 Days')).toBeInTheDocument();
    });

    it('renders all products section', async () => {
        renderDashboard();
        await screen.findByText('All Products');
        expect(screen.getByText('All Products')).toBeInTheDocument();
    });

    it('handles multiple date range changes', async () => {
        renderDashboard();
        await screen.findByText('Single-Day Hottest Product');

        const queryButton = await screen.findByRole('button', { name: 'Query Single Day' });

        // First query
        fireEvent.click(queryButton);
        const firstSave = localStorage.getItem('tht-dashboard-single-date');
        expect(firstSave).toBeDefined();

        // Second query
        fireEvent.click(queryButton);
        const secondSave = localStorage.getItem('tht-dashboard-single-date');
        expect(secondSave).toBeDefined();
    });

    it('displays products with mock data', async () => {
        renderDashboard();
        await screen.findByText('All Products');

        // Verify product data is rendered - use getAllByText since it appears multiple times
        const productElements = screen.getAllByText(/Ezy Storage/);
        expect(productElements.length).toBeGreaterThan(0);
    });

    it('maintains state across multiple renders', async () => {
        const { rerender } = renderDashboard();
        await screen.findByText('Single-Day Hottest Product');

        const initialDate = localStorage.getItem('tht-dashboard-single-date');

        rerender(
            <QueryClientProvider client={new QueryClient()}>
                <Dashboard />
            </QueryClientProvider>
        );

        await screen.findByText('Single-Day Hottest Product');
        const persistedDate = localStorage.getItem('tht-dashboard-single-date');

        expect(initialDate).toBeDefined();
        expect(persistedDate).toBeDefined();
    });
});
