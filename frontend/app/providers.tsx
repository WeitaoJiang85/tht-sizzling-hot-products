'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactNode, useEffect, useState } from 'react';

const CACHE_BUSTER = 'tht-query-cache-v1';

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 30, // 30 minutes
                refetchOnWindowFocus: false,
            },
        },
    });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
    if (typeof window === 'undefined') {
        return createQueryClient();
    }

    if (!browserQueryClient) {
        browserQueryClient = createQueryClient();
    }

    return browserQueryClient;
};

export function Providers({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();
    const [persister, setPersister] = useState<ReturnType<typeof createSyncStoragePersister> | null>(null);

    useEffect(() => {
        const storagePersister = createSyncStoragePersister({
            storage: window.localStorage,
            key: CACHE_BUSTER,
            throttleTime: 1000,
        });

        setPersister(storagePersister);
    }, []);

    if (!persister) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                buster: CACHE_BUSTER,
                maxAge: 1000 * 60 * 60, // 1 hour
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
