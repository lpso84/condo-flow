import { describe, it, expect } from 'vitest';
import { parsePagination, createPaginatedResponse, formatCurrency } from '../utils/helpers';

describe('Helpers', () => {
    describe('parsePagination', () => {
        it('should parse pagination params correctly', () => {
            const result = parsePagination({ page: 2, pageSize: 10 } as any);
            expect(result.page).toBe(2);
            expect(result.pageSize).toBe(10);
            expect(result.skip).toBe(10);
            expect(result.take).toBe(10);
        });

        it('should use defaults when params are missing', () => {
            const result = parsePagination({} as any);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(20);
        });
    });

    describe('createPaginatedResponse', () => {
        it('should create paginated response correctly', () => {
            const data = [1, 2, 3];
            const result = createPaginatedResponse(data, 100, {
                page: 1,
                pageSize: 20,
                skip: 0,
                take: 20,
            });

            expect(result.data).toEqual(data);
            expect(result.total).toBe(100);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(20);
            expect(result.totalPages).toBe(5);
        });
    });

    describe('formatCurrency', () => {
        it('should format currency in EUR', () => {
            const result = formatCurrency(1234.56);
            expect(result).toContain('1');
            expect(result).toContain('234');
            expect(result).toContain('56');
        });
    });
});
