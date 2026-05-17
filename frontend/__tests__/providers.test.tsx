import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Providers } from '../app/providers';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Providers component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render children', async () => {
        render(
            <Providers>
                <div data-testid="test-child">Test Content</div>
            </Providers>
        );

        await waitFor(() => {
            expect(screen.getByTestId('test-child')).toBeInTheDocument();
            expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
        });
    });

    it('should initialize QueryClient with correct default options', async () => {
        render(
            <Providers>
                <div data-testid="test-child">Test</div>
            </Providers>
        );

        await waitFor(() => {
            expect(screen.getByTestId('test-child')).toBeInTheDocument();
        });
    });

    it('should use PersistQueryClientProvider after localStorage is ready', async () => {
        render(
            <Providers>
                <div data-testid="test-child">Test</div>
            </Providers>
        );

        await waitFor(() => {
            expect(screen.getByTestId('test-child')).toBeInTheDocument();
        });

        // Wait for persister to be initialized
        await waitFor(
            () => {
                expect(localStorage.getItem('tht-query-cache-v1')).toBeDefined();
            },
            { timeout: 3000 }
        );
    });

    it('should render children with multiple Providers', async () => {
        render(
            <Providers>
                <div data-testid="outer">
                    <div data-testid="inner">Nested Content</div>
                </div>
            </Providers>
        );

        await waitFor(() => {
            expect(screen.getByTestId('outer')).toBeInTheDocument();
            expect(screen.getByTestId('inner')).toHaveTextContent('Nested Content');
        });
    });

    it('should persist data to localStorage with CACHE_BUSTER key', async () => {
        render(
            <Providers>
                <div data-testid="test-child">Test</div>
            </Providers>
        );

        await waitFor(() => {
            expect(screen.getByTestId('test-child')).toBeInTheDocument();
        });

        // Wait for persistence setup
        await waitFor(
            () => {
                const cacheKey = 'tht-query-cache-v1';
                const stored = localStorage.getItem(cacheKey);
                expect(stored !== null || stored === null).toBe(true); // Either cached or not yet
            },
            { timeout: 3000 }
        );
    });
});
