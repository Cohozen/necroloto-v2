import type { SortByRank } from './types';

/** Centralized TanStack Query keys. */
export const queryKeys = {
    users: {
        byClerk: (clerkId: string) => ['users', 'clerk', clerkId] as const,
    },
    circles: {
        summary: (userId: string, year: number) => ['circles', 'summary', userId, year] as const,
        detail: (id: string) => ['circles', 'detail', id] as const,
        byCode: (code: string) => ['circles', 'code', code] as const,
    },
    bets: {
        rank: (circleId: string, year: number, sort: SortByRank) =>
            ['bets', 'rank', circleId, year, sort] as const,
        byUser: (userId: string) => ['bets', 'user', userId] as const,
    },
    celebrities: {
        list: () => ['celebrities', 'list'] as const,
        adminList: (search: string, status: string) =>
            ['celebrities', 'admin-list', search, status] as const,
        detail: (id: string) => ['celebrities', 'detail', id] as const,
        deathFeed: (year: number, limit: number) => ['celebrities', 'deaths', year, limit] as const,
        wikidata: (name: string) => ['celebrities', 'wikidata', name] as const,
    },
} as const;
