/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Product Types
 */
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    revenue: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DailyTopProduct {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    date: string;
    ranking: number;
}

export interface ProductFilter {
    searchTerm: string;
    minRevenue: number;
    maxRevenue: number;
    sortBy: 'name' | 'revenue' | 'quantity';
    sortOrder: 'asc' | 'desc';
}

/**
 * Component Props Types
 */
export interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

export interface ErrorAlertProps {
    message: string;
    details?: string;
    onDismiss?: () => void;
}

export interface DashboardProps {
    isLoading?: boolean;
    error?: string | null;
    onError?: (error: string | null) => void;
}

/**
 * State Types
 */
export interface AppState {
    isLoading: boolean;
    error: string | null;
    selectedDate: Date;
    startDate: Date;
    endDate: Date;
}

/**
 * Request/Response Types
 */
export interface GetProductsRequest {
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}

export interface GetProductsResponse {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
}
