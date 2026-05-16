'use client';

import React from 'react';

interface DateSelectorProps {
    singleDate: string;
    onSingleDateChange: (value: string) => void;
    onApply: () => void;
    isLoading?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
    singleDate,
    onSingleDateChange,
    onApply,
    isLoading = false,
}) => {
    return (
        <section className="query-panel" aria-label="Single-day query controls">
            <div className="query-grid one-col is-visible">
                <label className="query-field">
                    <span>Selected Date</span>
                    <input
                        type="date"
                        value={singleDate}
                        onChange={(event) => onSingleDateChange(event.target.value)}
                        className="query-input"
                    />
                </label>
            </div>

            <button
                type="button"
                className="query-submit"
                disabled={isLoading}
                onClick={onApply}
            >
                {isLoading ? 'Loading...' : 'Query Single Day'}
            </button>
        </section>
    );
};
