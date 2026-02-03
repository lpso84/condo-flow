import type { LoginInput, LoginResponse, User } from '@condoflow/shared';

// Get API URL from environment variable
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Validate that VITE_API_URL is defined
if (!VITE_API_URL) {
    const errorMsg = `
[CondoFlow] CRITICAL ERROR: VITE_API_URL environment variable is not defined!

This variable MUST be set at BUILD TIME for the frontend to work correctly.

For Vercel deployment:
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add: VITE_API_URL = https://condo-flow-api.onrender.com

For local development:
1. Create a file: apps/web/.env.local
2. Add: VITE_API_URL=http://localhost:3000

Current environment: ${import.meta.env.MODE}
Is Production: ${import.meta.env.PROD}
`;
    console.error(errorMsg);
    throw new Error('VITE_API_URL environment variable is required. Check console for details.');
}

console.log('[CondoFlow API] Using API URL:', VITE_API_URL);

export const API_HOST = VITE_API_URL;
export const API_BASE = `${VITE_API_URL}/api`;

class ApiClient {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options?.headers,
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<{ data: T }> {
        const url = params
            ? `${endpoint}?${new URLSearchParams(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            )}`
            : endpoint;

        const response = await this.request<T>(url);
        return { data: response };
    }

    async post<T>(endpoint: string, data?: any): Promise<{ data: T }> {
        const response = await this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
        return { data: response };
    }

    async put<T>(endpoint: string, data: any): Promise<{ data: T }> {
        const response = await this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { data: response };
    }

    async delete<T>(endpoint: string): Promise<{ data: T }> {
        const response = await this.request<T>(endpoint, {
            method: 'DELETE',
        });
        return { data: response };
    }

    // Auth
    async login(credentials: LoginInput): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>('/auth/login', credentials);
        this.setToken(response.data.token);
        return response.data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.get<User>('/auth/me');
        return response.data;
    }

    logout() {
        this.clearToken();
    }
}

export const apiClient = new ApiClient();
