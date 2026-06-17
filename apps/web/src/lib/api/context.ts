import { createContext, useContext } from 'react';
import type { ApiClient } from './client';

export const ApiClientContext = createContext<ApiClient | null>(null);

/** Returns the authenticated API client provided by ApiClientProvider. */
export function useApiClient(): ApiClient {
    const client = useContext(ApiClientContext);
    if (!client) throw new Error('useApiClient must be used within an ApiClientProvider');
    return client;
}
