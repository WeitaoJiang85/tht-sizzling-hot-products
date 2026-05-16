'use client';

import { Providers } from './providers';
import { Dashboard } from '@/components/Dashboard';
import { useState } from 'react';

export default function Home() {
    const [error, setError] = useState<string | null>(null);

    return (
        <Providers>
            <Dashboard
                isLoading={false}
                error={error}
                onError={setError}
            />
        </Providers>
    );
}
