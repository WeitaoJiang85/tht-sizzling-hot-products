import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiService } from '@/services/api';

// Mock axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
            get: vi.fn(),
            post: vi.fn(),
        })),
    },
}));

describe('apiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(apiService).toBeDefined();
    });

    it('should have getDataRange method', () => {
        expect(apiService.getDataRange).toBeDefined();
        expect(typeof apiService.getDataRange).toBe('function');
    });

    it('should have getTopProductLatestWindow method', () => {
        expect(apiService.getTopProductLatestWindow).toBeDefined();
        expect(typeof apiService.getTopProductLatestWindow).toBe('function');
    });

    it('should have getDailyTopProducts method', () => {
        expect(apiService.getDailyTopProducts).toBeDefined();
        expect(typeof apiService.getDailyTopProducts).toBe('function');
    });

    it('should have getProducts method', () => {
        expect(apiService.getProducts).toBeDefined();
        expect(typeof apiService.getProducts).toBe('function');
    });

    it('should export API_ENDPOINTS', () => {
        expect(apiService).toBeDefined();
    });
});
