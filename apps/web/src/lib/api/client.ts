// Authenticated fetch wrapper around the NestJS API. The base URL comes from
// VITE_API_URL; the Clerk session token is injected as `Authorization: Bearer`.

const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
    status: number;
    body?: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

export type TokenGetter = () => Promise<string | null>;

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

export interface ApiClient {
    get<T>(path: string, opts?: RequestOptions): Promise<T>;
    post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
    patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
    delete<T>(path: string, opts?: RequestOptions): Promise<T>;
    request<T>(path: string, opts?: RequestOptions): Promise<T>;
}

export function createApiClient(getToken: TokenGetter): ApiClient {
    async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
        const { body, headers, ...rest } = opts;
        const token = await getToken();

        const res = await fetch(`${API_URL}${path}`, {
            ...rest,
            headers: {
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => undefined);
            const message =
                (errorBody as { message?: string })?.message ?? `${res.status} ${res.statusText}`;
            throw new ApiError(res.status, message, errorBody);
        }

        // Empty body (204, or Nest serializing a `null` return) -> null, never
        // undefined: TanStack Query forbids undefined as query data.
        if (res.status === 204) return null as T;
        const text = await res.text();
        return (text ? JSON.parse(text) : null) as T;
    }

    return {
        request,
        get: (path, opts) => request(path, { ...opts, method: 'GET' }),
        post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
        patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
        delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
    };
}
