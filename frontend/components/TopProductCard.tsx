'use client';

import Image from 'next/image';
import React from 'react';

interface TopProductCardProps {
    productName?: string;
    quantity?: number;
    subtitle?: string;
    productImageUrl?: string;
    fallbackImageUrl?: string;
    flameIconUrl?: string;
    layout?: 'vertical' | 'horizontal';
    priority?: boolean;
}

export const TopProductCard: React.FC<TopProductCardProps> = ({
    productName = 'No product yet',
    quantity = 0,
    subtitle = 'Top Product',
    productImageUrl,
    fallbackImageUrl = '/branding/bunnings-logo.jpg',
    flameIconUrl = '/branding/fire.svg',
    layout = 'vertical',
    priority = false,
}) => {
    const [imgSrc, setImgSrc] = React.useState(productImageUrl || fallbackImageUrl);

    React.useEffect(() => {
        setImgSrc(productImageUrl || fallbackImageUrl);
    }, [productImageUrl, fallbackImageUrl]);

    return (
        <article className={`top-product-card ${layout === 'horizontal' ? 'is-horizontal' : 'is-vertical'}`} aria-live="polite">
            <div className="top-product-main">
                <Image
                    src={imgSrc}
                    alt={productName}
                    width={layout === 'horizontal' ? 160 : 210}
                    height={layout === 'horizontal' ? 160 : 210}
                    className="top-product-image"
                    unoptimized
                    priority={priority}
                    onError={() => setImgSrc(fallbackImageUrl)}
                />

                <div className="top-product-copy">
                    <p className="top-product-subtitle">{subtitle}</p>
                    <h2 className="top-product-title">
                        <span>{productName}</span>
                        <Image
                            src={flameIconUrl}
                            alt=""
                            width={20}
                            height={20}
                            className="flame-icon"
                            aria-hidden="true"
                            unoptimized
                        />
                    </h2>

                    <div className="top-product-stats">
                        <span>Quantity Sold</span>
                        <strong>{quantity}</strong>
                    </div>
                </div>
            </div>
        </article>
    );
};
