'use client';

import React from 'react';

interface ErrorAlertProps {
    message: string;
    details?: string;
    onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, details, onDismiss }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-red-800 font-semibold">{message}</h3>
                    {details && <p className="text-red-700 text-sm mt-1">{details}</p>}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-600 hover:text-red-800 ml-2"
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};
