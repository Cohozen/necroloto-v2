import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useEffect, useMemo } from 'react';
import { useApiClient } from '@/lib/api/context';
import { CurrentUserContext } from '@/lib/api/currentUser';
import { useUserByClerkId } from '@/lib/api/queries';
import type { ApiUser, CreateUserPayload } from '@/lib/api/types';
import { isClerkConfigured } from '@/lib/auth/clerk';

/**
 * Resolves the Clerk session to a DB User row and exposes it via context. On
 * first sign-in the user may not exist yet, so we provision it (POST /users).
 * Without Clerk configured (previewable dev), provides a null user.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
    if (!isClerkConfigured) {
        // Previewable dev: no real session, treat as admin so admin UI stays reachable.
        return (
            <CurrentUserContext.Provider value={{ user: null, isLoading: false, isAdmin: true }}>
                {children}
            </CurrentUserContext.Provider>
        );
    }
    return <ClerkCurrentUserProvider>{children}</ClerkCurrentUserProvider>;
}

function ClerkCurrentUserProvider({ children }: { children: ReactNode }) {
    const api = useApiClient();
    const qc = useQueryClient();
    const { userId: clerkId } = useAuth();
    const { user: clerkUser } = useUser();

    const userQuery = useUserByClerkId(clerkId ?? undefined);

    const provision = useMutation({
        mutationFn: (payload: CreateUserPayload) => api.post<ApiUser>('/users', payload),
        onSuccess: (created) => {
            if (clerkId) qc.setQueryData(['users', 'clerk', clerkId], created);
        },
    });

    // Provision the DB row the first time a known Clerk user has no User yet.
    useEffect(() => {
        if (
            !clerkId ||
            !userQuery.isSuccess ||
            userQuery.data !== null ||
            provision.isPending ||
            provision.isSuccess
        ) {
            return;
        }
        provision.mutate({
            clerkId,
            email: clerkUser?.primaryEmailAddress?.emailAddress,
            image: clerkUser?.imageUrl,
            username: clerkUser?.username ?? undefined,
            firstname: clerkUser?.firstName ?? undefined,
            lastname: clerkUser?.lastName ?? undefined,
        });
    }, [clerkId, userQuery.isSuccess, userQuery.data, provision, clerkUser]);

    const roles = (clerkUser?.publicMetadata as { roles?: unknown } | undefined)?.roles;
    const isAdmin = Array.isArray(roles) && roles.includes('admin');

    const value = useMemo(
        () => ({
            user: userQuery.data ?? provision.data ?? null,
            isLoading: userQuery.isLoading || provision.isPending,
            isAdmin,
        }),
        [userQuery.data, userQuery.isLoading, provision.data, provision.isPending, isAdmin],
    );

    return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}
