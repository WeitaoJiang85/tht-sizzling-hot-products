'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message = 'Loading...',
}) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} animate-spin`}>
                <div className="w-full h-full border-4 border-gray-300 border-t-primary rounded-full" />
            </div>
            {message && <p className="text-gray-600">{message}</p>}
        </div>
    );
};
