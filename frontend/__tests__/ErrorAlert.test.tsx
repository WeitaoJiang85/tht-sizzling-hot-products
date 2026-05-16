import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorAlert } from '@/components/ErrorAlert';

describe('ErrorAlert Component', () => {
    it('renders error message', () => {
        render(<ErrorAlert message="An error occurred" />);
        const message = screen.getByText('An error occurred');
        expect(message).toBeInTheDocument();
    });

    it('renders error details when provided', () => {
        render(
            <ErrorAlert
                message="Error occurred"
                details="Connection timeout"
            />
        );
        const details = screen.getByText('Connection timeout');
        expect(details).toBeInTheDocument();
    });

    it('renders dismiss button when onDismiss is provided', () => {
        render(
            <ErrorAlert
                message="Error"
                onDismiss={() => { }}
            />
        );
        const dismissButton = screen.getByLabelText('Dismiss error');
        expect(dismissButton).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
        const onDismiss = vi.fn();
        render(
            <ErrorAlert
                message="Error"
                onDismiss={onDismiss}
            />
        );
        const dismissButton = screen.getByLabelText('Dismiss error');
        fireEvent.click(dismissButton);
        expect(onDismiss).toHaveBeenCalled();
    });
});
