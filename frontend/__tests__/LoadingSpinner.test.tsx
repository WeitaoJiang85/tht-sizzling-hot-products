import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
    it('renders loading spinner', () => {
        render(<LoadingSpinner />);
        const container = screen.getByText('Loading...');
        expect(container).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<LoadingSpinner message="Loading products..." />);
        const message = screen.getByText('Loading products...');
        expect(message).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="small" />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        rerender(<LoadingSpinner size="large" />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders without message when not provided', () => {
        render(<LoadingSpinner message="" />);
        const container = screen.queryByText('Loading...');
        expect(container).not.toBeInTheDocument();
    });
});
