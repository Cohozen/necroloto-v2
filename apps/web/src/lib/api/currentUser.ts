import { createContext, useContext } from 'react';
import type { ApiUser } from './types';

export interface CurrentUserState {
    /** The DB User row mapped from the Clerk session, once resolved. */
    user: ApiUser | null;
    /** True while resolving (querying / provisioning) the user. */
    isLoading: boolean;
}

export const CurrentUserContext = createContext<CurrentUserState>({
    user: null,
    isLoading: false,
});

/** Current DB user (resolved from Clerk). `user` is null when signed out or not yet provisioned. */
export function useCurrentUser(): CurrentUserState {
    return useContext(CurrentUserContext);
}
