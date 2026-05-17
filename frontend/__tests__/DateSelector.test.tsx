import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateSelector } from '@/components/DateSelector';

describe('DateSelector Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders date input with label', () => {
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        expect(screen.getByText('Selected Date')).toBeInTheDocument();
        const dateInput = screen.getByDisplayValue('2026-04-21');
        expect(dateInput).toBeInTheDocument();
    });

    it('calls onSingleDateChange when date changes', () => {
        const onSingleDateChange = vi.fn();
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={onSingleDateChange}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        const dateInput = screen.getByDisplayValue('2026-04-21') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2026-04-22' } });

        expect(onSingleDateChange).toHaveBeenCalledWith('2026-04-22');
    });

    it('renders submit button with "Query Single Day" label', () => {
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        const submitButton = screen.getByRole('button', { name: 'Query Single Day' });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
    });

    it('calls onApply when submit button is clicked', () => {
        const onApply = vi.fn();
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={onApply}
                isLoading={false}
            />
        );

        const submitButton = screen.getByRole('button', { name: 'Query Single Day' });
        fireEvent.click(submitButton);

        expect(onApply).toHaveBeenCalled();
    });

    it('disables button when isLoading is true', () => {
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={true}
            />
        );

        const submitButton = screen.getByRole('button', { name: 'Loading...' });
        expect(submitButton).toBeDisabled();
    });

    it('shows "Loading..." text when isLoading is true', () => {
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={true}
            />
        );

        expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Query Single Day' })).not.toBeInTheDocument();
    });

    it('handles empty date value', () => {
        render(
            <DateSelector
                singleDate=""
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        const dateInput = screen.getByDisplayValue('');
        expect(dateInput).toBeInTheDocument();
    });

    it('has correct aria-label on query section', () => {
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={vi.fn()}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        const section = screen.getByLabelText('Single-day query controls');
        expect(section).toBeInTheDocument();
    });

    it('handles rapid date changes', () => {
        const onSingleDateChange = vi.fn();
        render(
            <DateSelector
                singleDate="2026-04-21"
                onSingleDateChange={onSingleDateChange}
                onApply={vi.fn()}
                isLoading={false}
            />
        );

        const dateInput = screen.getByDisplayValue('2026-04-21') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2026-04-22' } });
        fireEvent.change(dateInput, { target: { value: '2026-04-23' } });
        fireEvent.change(dateInput, { target: { value: '2026-04-24' } });

        expect(onSingleDateChange).toHaveBeenCalledTimes(3);
        expect(onSingleDateChange).toHaveBeenLastCalledWith('2026-04-24');
    });
});
