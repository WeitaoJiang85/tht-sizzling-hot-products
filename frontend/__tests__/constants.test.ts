import { describe, it, expect } from 'vitest';
import {
    API_ENDPOINTS,
    QUERY_KEYS,
    COLORS,
    SIZES,
    SORT_OPTIONS,
    SORT_ORDER,
    DEFAULT_PAGE_SIZE,
    DEFAULT_TIMEOUT,
    DEFAULT_STALE_TIME,
    DEFAULT_GC_TIME,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '@/utils/constants';

describe('Constants', () => {
    describe('API endpoints', () => {
        it('defines API_ENDPOINTS object', () => {
            expect(API_ENDPOINTS).toBeDefined();
            expect(typeof API_ENDPOINTS).toBe('object');
        });

        it('has required endpoints', () => {
            expect(API_ENDPOINTS.PRODUCTS).toBe('/api/products');
            expect(API_ENDPOINTS.DAILY_TOP_PRODUCTS).toBe('/api/products/daily-top');
            expect(API_ENDPOINTS.HEALTH).toBe('/api/health');
        });

        it('has PRODUCT_BY_ID function', () => {
            expect(typeof API_ENDPOINTS.PRODUCT_BY_ID).toBe('function');
            expect(API_ENDPOINTS.PRODUCT_BY_ID('123')).toBe('/api/products/123');
        });
    });

    describe('Query keys', () => {
        it('defines QUERY_KEYS object', () => {
            expect(QUERY_KEYS).toBeDefined();
            expect(typeof QUERY_KEYS).toBe('object');
        });

        it('has string query keys', () => {
            expect(QUERY_KEYS.PRODUCTS).toBe('products');
            expect(QUERY_KEYS.DAILY_TOP_PRODUCTS).toBe('daily-top-products');
        });

        it('has PRODUCT function', () => {
            expect(typeof QUERY_KEYS.PRODUCT).toBe('function');
            expect(QUERY_KEYS.PRODUCT('123')).toEqual(['product', '123']);
        });
    });

    describe('Colors', () => {
        it('defines COLORS object', () => {
            expect(COLORS).toBeDefined();
            expect(typeof COLORS).toBe('object');
        });

        it('has all color values', () => {
            expect(COLORS.PRIMARY).toBe('#FF6500');
            expect(COLORS.PRIMARY_DARK).toBe('#E55A00');
            expect(COLORS.PRIMARY_LIGHT).toBe('#FF8533');
            expect(COLORS.DARK).toBe('#1F2937');
        });

        it('color values are valid hex codes', () => {
            Object.values(COLORS).forEach((color) => {
                expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            });
        });
    });

    describe('Sizes', () => {
        it('defines SIZES object', () => {
            expect(SIZES).toBeDefined();
            expect(typeof SIZES).toBe('object');
        });

        it('has required sizes', () => {
            expect(SIZES.SMALL).toBe('small');
            expect(SIZES.MEDIUM).toBe('medium');
            expect(SIZES.LARGE).toBe('large');
        });
    });

    describe('Sort options', () => {
        it('defines SORT_OPTIONS object', () => {
            expect(SORT_OPTIONS).toBeDefined();
            expect(typeof SORT_OPTIONS).toBe('object');
        });

        it('has required sort options', () => {
            expect(SORT_OPTIONS.NAME).toBe('name');
            expect(SORT_OPTIONS.REVENUE).toBe('revenue');
            expect(SORT_OPTIONS.QUANTITY).toBe('quantity');
        });
    });

    describe('Sort order', () => {
        it('defines SORT_ORDER object', () => {
            expect(SORT_ORDER).toBeDefined();
            expect(typeof SORT_ORDER).toBe('object');
        });

        it('has required order values', () => {
            expect(SORT_ORDER.ASC).toBe('asc');
            expect(SORT_ORDER.DESC).toBe('desc');
        });
    });

    describe('Numeric constants', () => {
        it('defines DEFAULT_PAGE_SIZE', () => {
            expect(DEFAULT_PAGE_SIZE).toBe(10);
            expect(typeof DEFAULT_PAGE_SIZE).toBe('number');
        });

        it('defines DEFAULT_TIMEOUT', () => {
            expect(DEFAULT_TIMEOUT).toBe(30000);
            expect(DEFAULT_TIMEOUT).toBeGreaterThan(0);
        });

        it('defines DEFAULT_STALE_TIME', () => {
            expect(DEFAULT_STALE_TIME).toBe(5 * 60 * 1000);
            expect(DEFAULT_STALE_TIME).toBeGreaterThan(0);
        });

        it('defines DEFAULT_GC_TIME', () => {
            expect(DEFAULT_GC_TIME).toBe(10 * 60 * 1000);
            expect(DEFAULT_GC_TIME).toBeGreaterThan(0);
        });
    });

    describe('Error messages', () => {
        it('defines ERROR_MESSAGES object', () => {
            expect(ERROR_MESSAGES).toBeDefined();
            expect(typeof ERROR_MESSAGES).toBe('object');
        });

        it('has all required error messages', () => {
            expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
            expect(ERROR_MESSAGES.API_ERROR).toBeDefined();
            expect(ERROR_MESSAGES.NOT_FOUND).toBeDefined();
            expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
            expect(ERROR_MESSAGES.FORBIDDEN).toBeDefined();
            expect(ERROR_MESSAGES.SERVER_ERROR).toBeDefined();
            expect(ERROR_MESSAGES.VALIDATION_ERROR).toBeDefined();
            expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
        });

        it('error messages are strings', () => {
            Object.values(ERROR_MESSAGES).forEach((msg) => {
                expect(typeof msg).toBe('string');
                expect(msg.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Success messages', () => {
        it('defines SUCCESS_MESSAGES object', () => {
            expect(SUCCESS_MESSAGES).toBeDefined();
            expect(typeof SUCCESS_MESSAGES).toBe('object');
        });

        it('has all required success messages', () => {
            expect(SUCCESS_MESSAGES.CREATED).toBeDefined();
            expect(SUCCESS_MESSAGES.UPDATED).toBeDefined();
            expect(SUCCESS_MESSAGES.DELETED).toBeDefined();
            expect(SUCCESS_MESSAGES.LOADED).toBeDefined();
        });

        it('success messages are strings', () => {
            Object.values(SUCCESS_MESSAGES).forEach((msg) => {
                expect(typeof msg).toBe('string');
                expect(msg.length).toBeGreaterThan(0);
            });
        });
    });
});
