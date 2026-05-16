/**
 * Testing utilities and mock data
 */

export const createMockProduct = (overrides = {}) => ({
    id: '1',
    name: 'Test Product',
    description: 'A test product',
    price: 100,
    quantity: 50,
    revenue: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

export const createMockDailyTopProduct = (overrides = {}) => ({
    productId: '1',
    productName: 'Top Product',
    quantitySold: 100,
    revenue: 10000,
    date: new Date().toISOString().split('T')[0],
    ranking: 1,
    ...overrides,
});

export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
    success: true,
    data,
    ...overrides,
});

export const createMockApiError = (message = 'API Error', overrides = {}) => ({
    success: false,
    error: message,
    ...overrides,
});
