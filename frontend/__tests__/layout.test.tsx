import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import RootLayout from '../app/layout';

describe('RootLayout component', () => {
    beforeEach(() => {
        // Reset any state
    });

    it('should render html and body elements', () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        const htmlElement = container.querySelector('html');
        const bodyElement = container.querySelector('body');

        expect(htmlElement).toBeInTheDocument();
        expect(bodyElement).toBeInTheDocument();
    });

    it('should have lang attribute set to en', () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        const htmlElement = container.querySelector('html');
        expect(htmlElement).toHaveAttribute('lang', 'en');
    });

    it('should have antialiased class on body', () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        const bodyElement = container.querySelector('body');
        expect(bodyElement?.className).toContain('antialiased');
    });

    it('should render children inside body', () => {
        const { getByTestId } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        const testChild = getByTestId('test-child');
        expect(testChild).toBeInTheDocument();
        expect(testChild).toHaveTextContent('Test Content');
    });

    it('should render multiple children', () => {
        const { getByTestId } = render(
            <RootLayout>
                <div data-testid="child-1">First</div>
                <div data-testid="child-2">Second</div>
            </RootLayout>
        );

        expect(getByTestId('child-1')).toBeInTheDocument();
        expect(getByTestId('child-2')).toBeInTheDocument();
    });
});
