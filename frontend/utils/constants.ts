/**
 * Constants used throughout the application
 */

export const API_ENDPOINTS = {
    PRODUCTS: '/api/products',
    DAILY_TOP_PRODUCTS: '/api/products/daily-top',
    PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
    HEALTH: '/api/health',
};

export const QUERY_KEYS = {
    PRODUCTS: 'products',
    DAILY_TOP_PRODUCTS: 'daily-top-products',
    PRODUCT: (id: string) => ['product', id],
};

export const COLORS = {
    PRIMARY: '#FF6500',
    PRIMARY_DARK: '#E55A00',
    PRIMARY_LIGHT: '#FF8533',
    DARK: '#1F2937',
    DARK_LIGHT: '#374151',
    DARK_LIGHTER: '#4B5563',
};

export const SIZES = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
};

export const SORT_OPTIONS = {
    NAME: 'name',
    REVENUE: 'revenue',
    QUANTITY: 'quantity',
};

export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
};

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_GC_TIME = 10 * 60 * 1000; // 10 minutes

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    API_ERROR: 'API error. Please try again.',
    NOT_FOUND: 'Resource not found.',
    UNAUTHORIZED: 'Unauthorized. Please log in.',
    FORBIDDEN: 'Access forbidden.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Validation error. Please check your input.',
    UNKNOWN_ERROR: 'An unknown error occurred.',
};

export const SUCCESS_MESSAGES = {
    CREATED: 'Successfully created.',
    UPDATED: 'Successfully updated.',
    DELETED: 'Successfully deleted.',
    LOADED: 'Data loaded successfully.',
};
