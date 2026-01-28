import type { LoginInput, LoginResponse, User } from '@condoflow/shared';

const API_BASE = '/api';

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

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = params
            ? `${endpoint}?${new URLSearchParams(
                Object.entries(params)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            )}`
            : endpoint;

        return this.request<T>(url);
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    // Auth
    async login(credentials: LoginInput): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>('/auth/login', credentials);
        this.setToken(response.token);
        return response;
    }

    async getCurrentUser(): Promise<User> {
        return this.get<User>('/auth/me');
    }

    logout() {
        this.clearToken();
    }
}

export const apiClient = new ApiClient();
