import type { CelebrityFilterValues, SortByRank } from './types';

/** Centralized TanStack Query keys. */
export const queryKeys = {
    users: {
        byClerk: (clerkId: string) => ['users', 'clerk', clerkId] as const,
    },
    circles: {
        summary: (userId: string, year: number) => ['circles', 'summary', userId, year] as const,
        detail: (id: string) => ['circles', 'detail', id] as const,
        byCode: (code: string) => ['circles', 'code', code] as const,
        bets: (id: string, year: number) => ['circles', 'bets', id, year] as const,
        search: (q: string) => ['circles', 'search', q] as const,
    },
    bets: {
        rank: (circleId: string, year: number, sort: SortByRank) =>
            ['bets', 'rank', circleId, year, sort] as const,
        byUser: (userId: string) => ['bets', 'user', userId] as const,
    },
    celebrities: {
        list: () => ['celebrities', 'list'] as const,
        catalogue: (search: string, filters: CelebrityFilterValues) =>
            ['celebrities', 'catalogue', search, filters] as const,
        adminList: (
            search: string,
            status: string,
            wikidata: string,
            filters: CelebrityFilterValues,
        ) => ['celebrities', 'admin-list', search, status, wikidata, filters] as const,
        facets: () => ['celebrities', 'facets'] as const,
        detail: (id: string) => ['celebrities', 'detail', id] as const,
        deathFeed: (year: number, limit: number) => ['celebrities', 'deaths', year, limit] as const,
        wikidata: (name: string) => ['celebrities', 'wikidata', name] as const,
        search: (q: string) => ['celebrities', 'search', q] as const,
    },
    seasons: {
        list: () => ['seasons', 'list'] as const,
        active: () => ['seasons', 'active'] as const,
        detail: (id: string) => ['seasons', 'detail', id] as const,
    },
    jobs: {
        list: (type?: string) => ['jobs', 'list', type ?? 'all'] as const,
        detail: (id: string) => ['jobs', 'detail', id] as const,
    },
    notifications: {
        list: () => ['notifications', 'list'] as const,
        unreadCount: () => ['notifications', 'unread-count'] as const,
    },
} as const;
