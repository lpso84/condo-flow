import { PaginationParams } from '@condoflow/shared';

export interface PaginationOptions {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
}

export function parsePagination(params: PaginationParams): PaginationOptions {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    return {
        page,
        pageSize,
        skip,
        take: pageSize,
    };
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    options: PaginationOptions
) {
    return {
        data,
        total,
        page: options.page,
        pageSize: options.pageSize,
        totalPages: Math.ceil(total / options.pageSize),
    };
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-PT').format(new Date(date));
}
