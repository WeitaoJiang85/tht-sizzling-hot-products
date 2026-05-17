import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Type definitions for API responses
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ProductDto {
    id: string;
    name: string;
    quantity: number;
    imageUrl?: string;
}

export interface DailyTopProductDto {
    productId: string;
    productName: string;
    quantitySold: number;
    date: string;
    imageUrl?: string;
}

export interface DataRangeDto {
    minDate: string;
    maxDate: string;
}

export interface ApiError extends AxiosError {
    message: string;
    code?: string;
}

/**
 * Create and configure axios instance for API communication
 */
const createApiClient = (): AxiosInstance => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

    const client = axios.create({
        baseURL,
        timeout,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            // Add authorization token if available
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            // Handle common errors
            if (error.response?.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('authToken');
                // TODO: Redirect to login page
            }

            if (error.response?.status === 403) {
                // Forbidden
                console.error('Access forbidden');
            }

            return Promise.reject(error);
        }
    );

    return client;
};

export const apiClient = createApiClient();

/**
 * API service methods
 */
export const apiService = {
    /**
     * Fetch products by date range
     */
    getProducts: async (
        params?: Record<string, any>
    ): Promise<ProductDto[]> => {
        const response = await apiClient.get<ApiResponse<ProductDto[]>>(
            '/api/products',
            { params }
        );
        return response.data.data || [];
    },

    /**
     * Fetch daily top products
     */
    getDailyTopProducts: async (
        date?: string
    ): Promise<DailyTopProductDto[]> => {
        const response = await apiClient.get<ApiResponse<DailyTopProductDto[]>>(
            '/api/products/daily-top',
            {
                params: { date },
            }
        );
        return response.data.data || [];
    },

    getTopProductLatestWindow: async (days = 3): Promise<DailyTopProductDto | null> => {
        const response = await apiClient.get<ApiResponse<DailyTopProductDto[]>>(
            '/api/products/top-latest-window',
            {
                params: { days },
            }
        );

        return response.data.data?.[0] ?? null;
    },

    getDataRange: async (): Promise<DataRangeDto | null> => {
        const response = await apiClient.get<ApiResponse<DataRangeDto | null>>('/api/products/data-range');
        return response.data.data ?? null;
    },

    /**
     * Health check
     */
    healthCheck: async (): Promise<boolean> => {
        try {
            const response = await apiClient.get('/api/health');
            return response.status === 200;
        } catch {
            return false;
        }
    },
};
