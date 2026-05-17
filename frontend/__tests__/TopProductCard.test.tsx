import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopProductCard } from '@/components/TopProductCard';

const fallbackImageUrl = 'http://localhost:5000/branding/logo.png';
const flameIconUrl = 'http://localhost:5000/branding/fire.svg';

describe('TopProductCard Component', () => {
    it('renders product card with default props', () => {
        render(<TopProductCard fallbackImageUrl={fallbackImageUrl} flameIconUrl={flameIconUrl} />);
        const productName = screen.getByText('No product yet');
        expect(productName).toBeInTheDocument();
    });

    it('renders with provided product data', () => {
        render(
            <TopProductCard
                productName="Test Product"
                quantity={100}
                subtitle="Top Product on 2026-04-23"
                fallbackImageUrl={fallbackImageUrl}
                flameIconUrl={flameIconUrl}
            />
        );
        const productName = screen.getByText('Test Product');
        const quantity = screen.getByText('100');
        const subtitle = screen.getByText('Top Product on 2026-04-23');

        expect(productName).toBeInTheDocument();
        expect(quantity).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
    });

    it('shows quantity sold label', () => {
        render(<TopProductCard quantity={12} fallbackImageUrl={fallbackImageUrl} flameIconUrl={flameIconUrl} />);
        expect(screen.getByText('Quantity Sold')).toBeInTheDocument();
    });
});
