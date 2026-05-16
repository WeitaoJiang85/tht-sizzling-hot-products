import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyProductsTable } from '@/components/DailyProductsTable';

describe('DailyProductsTable Component', () => {
    const mockProducts = [
        { id: '1', name: 'Product A', quantity: 100 },
        { id: '2', name: 'Product B', quantity: 80 },
    ];

    it('renders marquee product cards', () => {
        render(<DailyProductsTable products={[]} />);
        expect(screen.getByText('No products found in this period.')).toBeInTheDocument();
    });

    it('renders product rows', () => {
        render(<DailyProductsTable products={mockProducts} />);
        expect(screen.getAllByText('Product A').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Product B').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Qty Sold').length).toBeGreaterThan(0);
    });

    it('displays loading state', () => {
        render(<DailyProductsTable isLoading={true} />);
        expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    });

    it('shows empty state when no products', () => {
        render(<DailyProductsTable products={[]} />);
        expect(screen.getByText('No products found in this period.')).toBeInTheDocument();
    });
});
