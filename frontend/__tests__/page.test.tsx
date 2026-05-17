import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Home from '../app/page';

// Mock the Dashboard component
vi.mock('@/components/Dashboard', () => ({
    Dashboard: ({ isLoading, error, onError }: any) => (
        <div data-testid="dashboard">
            <div data-testid="dashboard-loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
            <div data-testid="dashboard-error">{error || 'No Error'}</div>
            <button
                data-testid="dashboard-error-button"
                onClick={() => onError('Test Error')}
            >
                Set Error
            </button>
        </div>
    ),
}));

// Mock the Providers component
vi.mock('@/app/providers', () => ({
    Providers: ({ children }: any) => (
        <div data-testid="providers">{children}</div>
    ),
}));

describe('Home page component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(<Home />);
        expect(screen.getByTestId('providers')).toBeInTheDocument();
    });

    it('should render Providers component wrapping Dashboard', () => {
        render(<Home />);

        const providers = screen.getByTestId('providers');
        expect(providers).toBeInTheDocument();

        const dashboard = screen.getByTestId('dashboard');
        expect(dashboard).toBeInTheDocument();
    });

    it('should pass isLoading={false} to Dashboard', () => {
        render(<Home />);

        const loadingState = screen.getByTestId('dashboard-loading');
        expect(loadingState).toHaveTextContent('Not Loading');
    });

    it('should pass error={null} initially to Dashboard', () => {
        render(<Home />);

        const errorState = screen.getByTestId('dashboard-error');
        expect(errorState).toHaveTextContent('No Error');
    });

    it('should update error state when onError is called', async () => {
        render(<Home />);

        const errorButton = screen.getByTestId('dashboard-error-button');
        errorButton.click();

        await waitFor(() => {
            const errorState = screen.getByTestId('dashboard-error');
            expect(errorState).toHaveTextContent('Test Error');
        });
    });

    it('should render Dashboard inside Providers', () => {
        const { container } = render(<Home />);

        const providers = container.querySelector('[data-testid="providers"]');
        const dashboard = container.querySelector('[data-testid="dashboard"]');

        expect(providers).toBeInTheDocument();
        expect(dashboard).toBeInTheDocument();

        // Verify Dashboard is inside Providers
        expect(providers?.contains(dashboard)).toBe(true);
    });
});
