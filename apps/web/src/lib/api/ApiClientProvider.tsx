import { useAuth } from '@clerk/clerk-react';
import { type ReactNode, useMemo } from 'react';
import { isClerkConfigured } from '@/lib/auth/clerk';
import { createApiClient } from './client';
import { ApiClientContext } from './context';

/**
 * Provides the authenticated API client. When Clerk is configured, the client
 * pulls the session token from `useAuth().getToken`; otherwise (previewable dev
 * without keys) it sends no token — protected endpoints will 401, by design.
 */
export function ApiClientProvider({ children }: { children: ReactNode }) {
    if (isClerkConfigured) return <ClerkApiClientProvider>{children}</ClerkApiClientProvider>;
    return <AnonApiClientProvider>{children}</AnonApiClientProvider>;
}

function ClerkApiClientProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const client = useMemo(() => createApiClient(() => getToken()), [getToken]);
    return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

function AnonApiClientProvider({ children }: { children: ReactNode }) {
    const client = useMemo(() => createApiClient(async () => null), []);
    return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}
