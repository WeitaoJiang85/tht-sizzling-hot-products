'use client';

import React from 'react';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    quantity: number;
    imageUrl?: string;
}

interface DailyProductsTableProps {
    products?: Product[];
    isLoading?: boolean;
    fallbackImageUrl?: string;
}

const ProductChip: React.FC<{ product: Product; fallbackImageUrl: string }> = ({ product, fallbackImageUrl }) => {
    const [imgSrc, setImgSrc] = React.useState(product.imageUrl || fallbackImageUrl);
    React.useEffect(() => {
        setImgSrc(product.imageUrl || fallbackImageUrl);
    }, [product.imageUrl, fallbackImageUrl]);
    return (
        <article
            role="listitem"
            className="product-chip"
        >
            <Image
                src={imgSrc}
                alt={product.name}
                width={48}
                height={48}
                className="product-chip-image"
                unoptimized
                onError={() => setImgSrc(fallbackImageUrl)}
            />
            <div className="product-chip-content">
                <h3>{product.name}</h3>
                <p>
                    <span>Qty Sold</span>
                    <strong>{product.quantity}</strong>
                </p>
            </div>
        </article>
    );
};

export const DailyProductsTable: React.FC<DailyProductsTableProps> = ({
    products = [],
    isLoading = false,
    fallbackImageUrl = '/branding/logo.png',
}) => {
    if (isLoading && products.length === 0) {
        return (
            <section className="all-products-wrap" aria-label="Loading products">
                <div className="all-products-track-frame">
                    <div className="all-products-skeleton-track" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <article className="product-chip skeleton-chip" key={`skeleton-chip-${index}`}>
                                <div className="skeleton-chip-image" />
                                <div className="product-chip-content skeleton-chip-copy">
                                    <div className="skeleton-chip-line" />
                                    <div className="skeleton-chip-line short" />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return <div className="all-products-state">No products found in this period.</div>;
    }

    const marqueeProducts = [...products, ...products];

    return (
        <section className="all-products-wrap" aria-label="All products rolling list">
            <div className="all-products-track-frame">
                <div className="marquee-track" role="list">
                    {marqueeProducts.map((product, index) => (
                        <ProductChip product={product} fallbackImageUrl={fallbackImageUrl} key={`${product.id}-${index}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};
