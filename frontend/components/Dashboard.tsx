'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import { TopProductCard } from './TopProductCard';
import { DailyProductsTable } from './DailyProductsTable';
import { DateSelector } from './DateSelector';
import { apiService } from '@/services/api';

interface DashboardProps {
    isLoading?: boolean;
    error?: string | null;
    onError?: (error: string | null) => void;
}

interface QueryParams {
    singleDate: string;
}

const BRAND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5099';
const BRAND_LOGO_URL = `${BRAND_BASE_URL}/branding/bunnings-logo.jpg`;
const PRODUCT_LOGO_URL = `${BRAND_BASE_URL}/branding/logo.png`;
const FIRE_ICON_URL = `${BRAND_BASE_URL}/branding/fire.svg`;
const DEFAULT_SINGLE_DATE = '2026-04-23';

const toAbsoluteImageUrl = (imageUrl?: string): string | undefined => {
    if (!imageUrl) {
        return undefined;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
        return `${BRAND_BASE_URL}${imageUrl}`;
    }

    return `${BRAND_BASE_URL}/${imageUrl}`;
};


export const Dashboard: React.FC<DashboardProps> = ({
    isLoading = false,
    error = null,
    onError,
}) => {
    const [singleDate, setSingleDate] = useState(DEFAULT_SINGLE_DATE);
    const [isHeaderCompact, setIsHeaderCompact] = useState(false);
    const headerRef = React.useRef<HTMLElement | null>(null);
    const firstSectionRef = React.useRef<HTMLElement | null>(null);
    const lastScrollYRef = React.useRef(0);
    const hasDirectionBaselineRef = React.useRef(false);
    const scrollDirectionRef = React.useRef<'up' | 'down' | 'none'>('none');
    const directionalDistanceRef = React.useRef(0);
    const [submittedQuery, setSubmittedQuery] = useState<QueryParams>({
        singleDate: DEFAULT_SINGLE_DATE,
    });

    // Height values must match CSS
    const EXPANDED_HEIGHT = 205;
    const COMPACT_HEIGHT = 80;
    const COMPACT_ENTER_OFFSET = 8;
    const COMPACT_EXIT_OFFSET = 42;
    const MIN_DIRECTION_DISTANCE = 12;

    useEffect(() => {
        let ticking = false;

        const update = () => {
            const firstSectionTop = firstSectionRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
            const currentScrollY = window.scrollY || window.pageYOffset || 0;
            const previousScrollY = lastScrollYRef.current;
            const scrollDelta = currentScrollY - previousScrollY;

            // Ignore tiny sub-pixel movement to keep direction detection stable.
            const scrollingDown = currentScrollY > previousScrollY + 1;
            const scrollingUp = currentScrollY < previousScrollY - 1;

            if (scrollingDown) {
                if (scrollDirectionRef.current !== 'down') {
                    scrollDirectionRef.current = 'down';
                    directionalDistanceRef.current = Math.abs(scrollDelta);
                } else {
                    directionalDistanceRef.current += Math.abs(scrollDelta);
                }
            } else if (scrollingUp) {
                if (scrollDirectionRef.current !== 'up') {
                    scrollDirectionRef.current = 'up';
                    directionalDistanceRef.current = Math.abs(scrollDelta);
                } else {
                    directionalDistanceRef.current += Math.abs(scrollDelta);
                }
            }

            const hasDownMomentum = scrollDirectionRef.current === 'down' && directionalDistanceRef.current >= MIN_DIRECTION_DISTANCE;
            const hasUpMomentum = scrollDirectionRef.current === 'up' && directionalDistanceRef.current >= MIN_DIRECTION_DISTANCE;
            lastScrollYRef.current = currentScrollY;

            // Add hysteresis so the compact state does not flip-flop near the boundary.
            setIsHeaderCompact((prev) => {
                // Allow the first measurement to establish an initial state.
                if (!hasDirectionBaselineRef.current) {
                    hasDirectionBaselineRef.current = true;
                    if (firstSectionTop <= EXPANDED_HEIGHT + COMPACT_ENTER_OFFSET) {
                        return true;
                    }

                    if (firstSectionTop >= EXPANDED_HEIGHT + COMPACT_EXIT_OFFSET) {
                        return false;
                    }

                    return prev;
                }

                // Only compact while scrolling down.
                if (!prev && hasDownMomentum && firstSectionTop <= EXPANDED_HEIGHT + COMPACT_ENTER_OFFSET) {
                    directionalDistanceRef.current = 0;
                    return true;
                }

                // Only expand while scrolling up.
                if (prev && hasUpMomentum && firstSectionTop >= EXPANDED_HEIGHT + COMPACT_EXIT_OFFSET) {
                    directionalDistanceRef.current = 0;
                    return false;
                }

                return prev;
            });
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const dataRangeQuery = useQuery({
        queryKey: ['data-range'],
        queryFn: () => apiService.getDataRange(),
        staleTime: 0,
        refetchOnWindowFocus: false,
    });

    const latestWindowTopQuery = useQuery({
        queryKey: ['latest-window-top', 3],
        queryFn: () => apiService.getTopProductLatestWindow(3),
        staleTime: 0,
        refetchOnWindowFocus: false,
    });

    const topProductQuery = useQuery({
        queryKey: ['top-product', submittedQuery],
        queryFn: async () => {
            let queryDate = submittedQuery.singleDate;
            const range = dataRangeQuery.data;

            if (range && (queryDate < range.minDate || queryDate > range.maxDate)) {
                queryDate = range.maxDate;
            }

            const dayData = await apiService.getDailyTopProducts(queryDate);
            return dayData[0] ?? null;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });

    const allProductsQuery = useQuery({
        queryKey: ['retail-products-fixed-latest-3days'],
        queryFn: async () => {
            return apiService.getProducts();
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });

    const hasBootstrappedData = Boolean(
        dataRangeQuery.data ||
        latestWindowTopQuery.data ||
        topProductQuery.data ||
        (allProductsQuery.data && allProductsQuery.data.length > 0)
    );

    const combinedLoading = isLoading ||
        (!hasBootstrappedData && (
            dataRangeQuery.isLoading ||
            topProductQuery.isLoading ||
            allProductsQuery.isLoading ||
            latestWindowTopQuery.isLoading
        ));
    const combinedError = error ||
        dataRangeQuery.error?.message ||
        topProductQuery.error?.message ||
        allProductsQuery.error?.message ||
        latestWindowTopQuery.error?.message ||
        null;

    useEffect(() => {
        onError?.(combinedError);
    }, [combinedError, onError]);

    const topProduct = topProductQuery.data;
    const latestWindowTopProduct = latestWindowTopQuery.data;
    const tableProducts = useMemo(
        () =>
            (allProductsQuery.data ?? []).map((product) => ({
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                imageUrl: toAbsoluteImageUrl(product.imageUrl),
            })),
        [allProductsQuery.data]
    );

    const currentTopSubtitle = `Top Product on ${submittedQuery.singleDate}`;

    const handleApply = () => {
        onError?.(null);
        let safeSingleDate = singleDate;
        if (dataRangeQuery.data) {
            const range = dataRangeQuery.data;
            if (safeSingleDate < range.minDate || safeSingleDate > range.maxDate) {
                safeSingleDate = range.maxDate;
                setSingleDate(range.maxDate);
            }
        }

        setSubmittedQuery({
            singleDate: safeSingleDate,
        });
    };

    return (
        <div className="retail-page">
            <header
                ref={headerRef}
                className={`retail-header ${isHeaderCompact ? 'is-compact' : ''}`}
                style={{ height: `${isHeaderCompact ? COMPACT_HEIGHT : EXPANDED_HEIGHT}px` }}
            >
                <div className="retail-header-inner">
                    <a
                        href="https://www.bunnings.com.au/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit Bunnings website"
                    >
                        <Image
                            src={BRAND_LOGO_URL}
                            alt="Bunnings"
                            className="brand-logo"
                            width={300}
                            height={140}
                            unoptimized
                            priority
                        />
                    </a>
                    <div className="brand-text">
                        <h1 className="brand-title">Sizzling Hot Products</h1>
                        <p className="brand-kicker">Find the hottest picks for everyday projects</p>
                    </div>
                </div>
            </header>

            {combinedError && (
                <ErrorAlert
                    message="Failed to load the latest products"
                    details={combinedError}
                    onDismiss={() => onError?.(null)}
                />
            )}

            {combinedLoading ? (
                <div className="loading-panel">
                    <LoadingSpinner size="large" message="Preparing your product highlights..." />
                </div>
            ) : (
                <main className="retail-content">
                    <section ref={firstSectionRef} className="section-card">
                        <header className="section-heading">Single-Day Hottest Product</header>
                        <div className="query-result-grid">
                            <DateSelector
                                singleDate={singleDate}
                                onSingleDateChange={setSingleDate}
                                onApply={handleApply}
                                isLoading={topProductQuery.isFetching}
                            />

                            <div className="stable-slot top-slot">
                                {topProductQuery.isLoading && !topProduct ? (
                                    <div className="skeleton-card" aria-hidden="true">
                                        <div className="skeleton-media" />
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line long" />
                                        <div className="skeleton-pill" />
                                    </div>
                                ) : (
                                    <TopProductCard
                                        productName={topProduct?.productName || 'No top product for this day'}
                                        quantity={topProduct?.quantitySold || 0}
                                        subtitle={currentTopSubtitle}
                                        productImageUrl={toAbsoluteImageUrl(topProduct?.imageUrl)}
                                        fallbackImageUrl={PRODUCT_LOGO_URL}
                                        flameIconUrl={FIRE_ICON_URL}
                                        layout="vertical"
                                        priority
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="section-card">
                        <header className="section-heading">Top Product Over Latest 3 Days</header>
                        <div className="stable-slot latest-slot">
                            {latestWindowTopQuery.isLoading && !latestWindowTopProduct ? (
                                <div className="skeleton-card horizontal" aria-hidden="true">
                                    <div className="skeleton-media" />
                                    <div className="skeleton-copy">
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line long" />
                                        <div className="skeleton-pill" />
                                    </div>
                                </div>
                            ) : (
                                <TopProductCard
                                    productName={latestWindowTopProduct?.productName || 'No top product in latest 3 days'}
                                    quantity={latestWindowTopProduct?.quantitySold || 0}
                                    subtitle="Cumulative quantity sold in the latest 3 days"
                                    productImageUrl={toAbsoluteImageUrl(latestWindowTopProduct?.imageUrl)}
                                    fallbackImageUrl={PRODUCT_LOGO_URL}
                                    flameIconUrl={FIRE_ICON_URL}
                                    layout="horizontal"
                                />
                            )}
                        </div>
                    </section>

                    <section className="section-card all-products-section">
                        <header className="section-heading">All Products</header>
                        <DailyProductsTable
                            products={tableProducts}
                            isLoading={allProductsQuery.isFetching}
                            fallbackImageUrl={PRODUCT_LOGO_URL}
                        />
                    </section>
                </main>
            )}

            <footer className="retail-footer">
                <span>powered by Gavin Jiang</span>
                <a
                    className="linkedin-button"
                    href="https://www.linkedin.com/in/weitao-jiang"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Visit Gavin Jiang LinkedIn profile"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.45 20.45h-3.56v-5.59c0-1.33-.03-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
                    </svg>
                </a>
            </footer>
        </div>
    );
};
