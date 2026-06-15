// TanStack Query hooks over the authenticated API client. Query keys live in
// keys.ts; Api*->UI adapters live in adapters.ts.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './context';
import { queryKeys } from './keys';
import type {
    ApiBet,
    ApiCircle,
    ApiMembership,
    ApiUser,
    CircleSummaryDto,
    CreateCirclePayload,
    CreateMembershipPayload,
    DeathFeedEntryDto,
    RankedBet,
    SortByRank,
} from './types';

export type { SortByRank };

export const CURRENT_YEAR = new Date().getFullYear();

// --- Users ---

export function useUserByClerkId(clerkId: string | undefined) {
    const api = useApiClient();
    return useQuery({
        queryKey: clerkId ? queryKeys.users.byClerk(clerkId) : ['users', 'clerk', 'none'],
        queryFn: () => api.get<ApiUser | null>(`/users/clerk/${clerkId}`),
        enabled: !!clerkId,
    });
}

// --- Circles ---

export function useCircleSummaries(userId: string | undefined, year = CURRENT_YEAR) {
    const api = useApiClient();
    return useQuery({
        queryKey: userId ? queryKeys.circles.summary(userId, year) : ['circles', 'summary', 'none'],
        queryFn: () => api.get<CircleSummaryDto[]>(`/circle/user/${userId}/summary?year=${year}`),
        enabled: !!userId,
    });
}

export function useCircleDetail(circleId: string | undefined) {
    const api = useApiClient();
    return useQuery({
        queryKey: circleId ? queryKeys.circles.detail(circleId) : ['circles', 'detail', 'none'],
        queryFn: () => api.get<ApiCircle>(`/circle/${circleId}`),
        enabled: !!circleId,
    });
}

export function useCreateCircle() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCirclePayload) => api.post<ApiCircle>('/circle', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

/** Join a circle by code: resolve the circle, then create the membership. */
export function useJoinCircleByCode() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ code, userId }: { code: string; userId: string }) => {
            const circle = await api.get<ApiCircle | null>(`/circle/code/${code}`);
            if (!circle) throw new Error('Aucun cercle ne correspond à ce code.');
            const payload: CreateMembershipPayload = { userId, circleId: circle.id };
            await api.post<ApiMembership>('/membership', payload);
            return circle;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

// --- Bets / leaderboard ---

export function useCircleRank(
    circleId: string | undefined,
    year = CURRENT_YEAR,
    sort: SortByRank = 'points',
) {
    const api = useApiClient();
    return useQuery({
        queryKey: circleId ? queryKeys.bets.rank(circleId, year, sort) : ['bets', 'rank', 'none'],
        queryFn: () =>
            api.get<RankedBet[]>(`/bets/circle/${circleId}/rank?year=${year}&sort=${sort}`),
        enabled: !!circleId,
    });
}

export function useUserBets(userId: string | undefined) {
    const api = useApiClient();
    return useQuery({
        // Note: this endpoint returns plain bets (no rank/total) — totals are
        // derived client-side from CelebritiesOnBet.
        queryKey: userId ? queryKeys.bets.byUser(userId) : ['bets', 'user', 'none'],
        queryFn: () => api.get<ApiBet[]>(`/bets/user/${userId}`),
        enabled: !!userId,
    });
}

// --- Celebrities ---

export function useDeathFeed(year = CURRENT_YEAR, limit = 10) {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.celebrities.deathFeed(year, limit),
        queryFn: () =>
            api.get<DeathFeedEntryDto[]>(`/celebrities/deaths/feed?year=${year}&limit=${limit}`),
    });
}
