import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: 'Sizzling Hot Products | Bunnings Picks',
    description: 'Explore top-selling products and rolling three-day sales highlights in a customer-friendly storefront view.',
    keywords: ['Bunnings', 'hot products', 'best sellers', 'retail products', 'daily top product'],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
