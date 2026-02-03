import type { LoginInput, LoginResponse, User } from '@condoflow/shared';

// ============================================================================
// API URL Configuration
// ============================================================================

// Get API URL from environment variable (set at BUILD TIME by Vite)
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Validate that VITE_API_URL is defined - this MUST be set for the app to work
if (!VITE_API_URL) {
    const errorMsg = `
[CondoFlow] CRITICAL ERROR: VITE_API_URL environment variable is not defined!

This variable MUST be set at BUILD TIME for the frontend to work correctly.
The variable is embedded into the JavaScript bundle during the Vite build process.

For Vercel deployment:
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add: VITE_API_URL = https://condo-flow-api.onrender.com
3. Make sure it's enabled for "Production" environment
4. Trigger a new deployment (the variable must be present during BUILD)

For local development:
1. Create a file: apps/web/.env.local
2. Add: VITE_API_URL=http://localhost:3000
3. Restart the dev server

Current environment: ${import.meta.env.MODE}
Is Production: ${import.meta.env.PROD}
`;
    console.error(errorMsg);
    throw new Error('VITE_API_URL environment variable is required. Check console for details.');
}

// Normalize URL: remove trailing slash to prevent double slashes
const API_URL = VITE_API_URL.replace(/\/+$/, '');

// Log the API URL being used (helpful for debugging production issues)
console.log('[CondoFlow API] Using API URL:', API_URL);
console.log('[CondoFlow API] Environment:', import.meta.env.MODE);

// Export the base URLs
export const API_HOST = API_URL;
export const API_BASE = `${API_URL}/api`;

// ============================================================================
// Standalone API Helper Functions (for use outside ApiClient if needed)
// ============================================================================

/**
 * Build a full API URL from a path
 * @param path - The API path (e.g., '/auth/login' or 'auth/login')
 * @returns Full URL (e.g., 'https://condo-flow-api.onrender.com/api/auth/login')
 */
export function buildApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${normalizedPath}`;
}

/**
 * Make a POST request to the API
 * @param path - The API path (e.g., '/auth/login')
 * @param body - The request body
 * @param options - Additional fetch options
 */
export async function apiPost<T>(
    path: string,
    body?: unknown,
    options?: RequestInit
): Promise<T> {
    const url = buildApiUrl(path);
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * Make a GET request to the API
 * @param path - The API path (e.g., '/auth/me')
 * @param options - Additional fetch options
 */
export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(path);
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

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
