// TanStack Query hooks over the authenticated API client. Query keys live in
// keys.ts; Api*->UI adapters live in adapters.ts.

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './context';
import { useCurrentUser } from './currentUser';
import { queryKeys } from './keys';
import type {
    AdminCelebrityPage,
    AdminCelebrityStatus,
    ApiBet,
    ApiCelebrity,
    ApiCelebrityDetail,
    ApiCelebrityListItem,
    ApiCircle,
    ApiMembership,
    ApiNotification,
    ApiSeason,
    ApiUser,
    BulkDeleteResult,
    CircleSearchResultDto,
    CircleSummaryDto,
    CreateBetPayload,
    CreateCelebrityPayload,
    CreateCirclePayload,
    CreateMembershipPayload,
    CreateSeasonPayload,
    DeathFeedEntryDto,
    EnrichCelebrityPayload,
    ProposeCelebrityPayload,
    RankedBet,
    ReplaceCelebritiesPayload,
    SortByRank,
    SyncJob,
    UnreadCountDto,
    UpdateCelebrityPayload,
    UpdateCirclePayload,
    UpdateMemberRolePayload,
    UpdateSeasonPayload,
    UpdateUserPayload,
    WikidataSummaryDto,
} from './types';

export type { SortByRank };

export const CURRENT_YEAR = new Date().getFullYear();

/** Max celebrities a player can draft in a single bet. */
export const MAX_BET_CELEBRITIES = 50;

// --- Users ---

export function useUserByClerkId(clerkId: string | undefined) {
    const api = useApiClient();
    return useQuery({
        queryKey: clerkId ? queryKeys.users.byClerk(clerkId) : ['users', 'clerk', 'none'],
        queryFn: () => api.get<ApiUser | null>(`/users/clerk/${clerkId}`),
        enabled: !!clerkId,
    });
}

/** Update the current user's profile (PATCH /users/:id), then refresh its cache. */
export function useUpdateUser() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string; clerkId: string } & UpdateUserPayload) =>
            api.patch<ApiUser>(`/users/${id}`, payload),
        onSuccess: (updated, { clerkId }) => {
            qc.setQueryData(queryKeys.users.byClerk(clerkId), updated);
        },
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

export function useUpdateCircle(circleId: string) {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateCirclePayload) =>
            api.patch<ApiCircle>(`/circle/${circleId}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

export function useDeleteCircle() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (circleId: string) => api.delete<ApiCircle>(`/circle/${circleId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

/** Leave a circle: a member removes their own membership (no admin rights needed). */
export function useLeaveCircle() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (membershipId: string) =>
            api.delete<ApiMembership>(`/membership/${membershipId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

export function useRemoveMember(circleId: string) {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) =>
            api.delete<ApiMembership>(`/circle/${circleId}/members/${userId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

export function useUpdateMemberRole(circleId: string) {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string } & UpdateMemberRolePayload) =>
            api.patch<ApiMembership>(`/circle/${circleId}/members/${userId}`, { role }),
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

/** Circle bets for the "Paris" tab — others' picks stay secret until reveal. */
export function useCircleBets(circleId: string | undefined, year = CURRENT_YEAR) {
    const api = useApiClient();
    return useQuery({
        queryKey: circleId ? queryKeys.circles.bets(circleId, year) : ['circles', 'bets', 'none'],
        queryFn: () => api.get<ApiBet[]>(`/circle/${circleId}/bets?year=${year}`),
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

// --- Bets (draft) ---

export function useCreateBet() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBetPayload) => api.post<ApiBet>('/bets', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bets'] });
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

/** Replace a bet's full celebrity list (PATCH /bets/:id/celebrities). */
export function useReplaceBetCelebrities() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ betId, celebrities }: { betId: string } & ReplaceCelebritiesPayload) =>
            api.patch<ApiBet>(`/bets/${betId}/celebrities`, { celebrities }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bets'] });
            qc.invalidateQueries({ queryKey: ['circles'] });
        },
    });
}

// --- Celebrities ---

export function useCelebrities() {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.celebrities.list(),
        queryFn: () => api.get<ApiCelebrityListItem[]>('/celebrities'),
    });
}

export function useCelebrity(id: string | undefined) {
    const api = useApiClient();
    return useQuery({
        queryKey: id ? queryKeys.celebrities.detail(id) : ['celebrities', 'detail', 'none'],
        queryFn: () => api.get<ApiCelebrityDetail>(`/celebrities/${id}`),
        enabled: !!id,
    });
}

export function useDeathFeed(year = CURRENT_YEAR, limit = 10) {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.celebrities.deathFeed(year, limit),
        queryFn: () =>
            api.get<DeathFeedEntryDto[]>(`/celebrities/deaths/feed?year=${year}&limit=${limit}`),
    });
}

// --- Celebrities (admin) ---

/** Page size for the admin catalogue infinite scroll. */
export const ADMIN_CATALOGUE_PAGE = 24;

/**
 * Paginated admin catalogue (GET /celebrities/admin/list) with server-side name
 * search, status filter and alphabetical order. Drives infinite scroll.
 */
export function useAdminCelebrities(params: {
    search: string;
    status: AdminCelebrityStatus;
    /** Wikidata-link axis, orthogonal to `status` (e.g. "unlinked" = wikidataId null). */
    wikidata?: 'linked' | 'unlinked';
}) {
    const api = useApiClient();
    const search = params.search.trim();
    const { status, wikidata } = params;
    return useInfiniteQuery({
        queryKey: queryKeys.celebrities.adminList(search, status, wikidata ?? ''),
        initialPageParam: 0,
        queryFn: ({ pageParam }) => {
            const qs = new URLSearchParams({
                status,
                take: String(ADMIN_CATALOGUE_PAGE),
                skip: String(pageParam),
            });
            if (search) qs.set('search', search);
            if (wikidata) qs.set('wikidata', wikidata);
            return api.get<AdminCelebrityPage>(`/celebrities/admin/list?${qs.toString()}`);
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((acc, page) => acc + page.items.length, 0);
            return loaded < lastPage.total ? loaded : undefined;
        },
    });
}

export function useCreateCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCelebrityPayload) =>
            api.post<ApiCelebrity>('/celebrities', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

export function useUpdateCelebrity(id: string) {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateCelebrityPayload) =>
            api.patch<ApiCelebrity>(`/celebrities/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

export function useDeleteCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete<ApiCelebrity>(`/celebrities/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

/** Delete several celebrities at once (admin bulk action). */
export function useBulkDeleteCelebrities() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) =>
            api.delete<BulkDeleteResult>('/celebrities/bulk', { body: { ids } }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

/**
 * Enqueue an async bulk Wikidata enrich (admin). Returns the created job
 * immediately; follow its progress with `useSyncJob(job.id)`. The catalogue is
 * invalidated once the job reaches a terminal state, not here.
 */
export function useBulkEnrichCelebrities() {
    const api = useApiClient();
    return useMutation({
        mutationFn: (ids: string[]) => api.post<SyncJob>('/jobs/bulk-enrich', { ids }),
    });
}

/**
 * Poll a single job for live progress. Refetches every ~1.5s while the job is
 * still pending/running, then stops once it's terminal. Disabled when `id` is
 * null (no job in flight).
 */
export function useSyncJob(id: string | null) {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.jobs.detail(id ?? ''),
        queryFn: () => api.get<SyncJob>(`/jobs/${id}`),
        enabled: id !== null,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'SUCCEEDED' || status === 'FAILED' ? false : 1500;
        },
    });
}

/** Recent jobs for the automation history (admin). Optional type filter. */
export function useRecentJobs(type?: string) {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.jobs.list(type),
        queryFn: () =>
            api.get<SyncJob[]>(`/jobs${type ? `?type=${encodeURIComponent(type)}` : ''}`),
        refetchInterval: 5000,
    });
}

/** Trigger the death-detection scan on demand (admin). Recorded as a job. */
export function useDetectDeaths() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            api.post<{ checked: number; newDeaths: unknown[] }>('/automation/detect-deaths', {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['jobs'] });
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

/** Enrich a celebrity from Wikidata (fills birth/death/photo, links the QID). */
export function useEnrichCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & EnrichCelebrityPayload) =>
            api.post<ApiCelebrity>(`/celebrities/${id}/enrich`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

/**
 * Propose a missing celebrity from the bet draft (POST /celebrities/propose).
 * The API creates it PENDING (or returns an existing dedup match). Invalidates
 * the catalogue so the proposer's pending pick shows up.
 */
export function useProposeCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: ProposeCelebrityPayload) =>
            api.post<ApiCelebrity>('/celebrities/propose', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
        },
    });
}

/** Admin: approve a proposed celebrity (optionally enrich from Wikidata first). */
export function useApproveCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & EnrichCelebrityPayload) =>
            api.post<ApiCelebrity>(`/celebrities/${id}/approve`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
            qc.invalidateQueries({ queryKey: ['bets'] });
        },
    });
}

/** Admin: reject a proposed celebrity (kept REJECTED, pulled from bets). */
export function useRejectCelebrity() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.post<ApiCelebrity>(`/celebrities/${id}/reject`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
            qc.invalidateQueries({ queryKey: ['bets'] });
        },
    });
}

/** Admin: merge a duplicate (source) into a target celebrity, redirecting bets. */
export function useMergeCelebrities() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
            api.post<ApiCelebrity>(`/celebrities/${sourceId}/merge/${targetId}`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['celebrities'] });
            qc.invalidateQueries({ queryKey: ['bets'] });
        },
    });
}

/** Wikidata candidates for a name (admin disambiguation). Enabled when name is set. */
export function useWikidataSearch(name: string) {
    const api = useApiClient();
    const trimmed = name.trim();
    return useQuery({
        queryKey: queryKeys.celebrities.wikidata(trimmed),
        queryFn: () =>
            api.get<WikidataSummaryDto[]>(
                `/celebrities/wikidata/search?name=${encodeURIComponent(trimmed)}`,
            ),
        enabled: trimmed.length > 0,
    });
}

// --- Global search ---

/** Circle name search (public + own circles) for the global search palette. */
export function useCircleSearch(query: string) {
    const api = useApiClient();
    const trimmed = query.trim();
    return useQuery({
        queryKey: queryKeys.circles.search(trimmed),
        queryFn: () =>
            api.get<CircleSearchResultDto[]>(`/circle/search?q=${encodeURIComponent(trimmed)}`),
        enabled: trimmed.length > 0,
    });
}

/** Celebrity name search (visibility-aware) for the global search palette. */
export function useCelebritySearch(query: string) {
    const api = useApiClient();
    const trimmed = query.trim();
    return useQuery({
        queryKey: queryKeys.celebrities.search(trimmed),
        queryFn: () => api.post<ApiCelebrity[]>('/celebrities/search', { name: trimmed }),
        enabled: trimmed.length > 0,
    });
}

// --- Seasons ---

export function useSeasons() {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.seasons.list(),
        queryFn: () => api.get<ApiSeason[]>('/seasons'),
    });
}

/** The active season (resolved server-side by date window). May be null. */
export function useActiveSeason() {
    const api = useApiClient();
    return useQuery({
        queryKey: queryKeys.seasons.active(),
        queryFn: () => api.get<ApiSeason | null>('/seasons/active'),
    });
}

export function useSeason(id: string | undefined) {
    const api = useApiClient();
    return useQuery({
        queryKey: id ? queryKeys.seasons.detail(id) : ['seasons', 'detail', 'none'],
        queryFn: () => api.get<ApiSeason | null>(`/seasons/${id}`),
        enabled: !!id,
    });
}

export function useCreateSeason() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSeasonPayload) => api.post<ApiSeason>('/seasons', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seasons'] });
        },
    });
}

export function useUpdateSeason(id: string) {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateSeasonPayload) =>
            api.patch<ApiSeason>(`/seasons/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seasons'] });
        },
    });
}

export function useDeleteSeason() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete<ApiSeason>(`/seasons/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seasons'] });
        },
    });
}

/**
 * The active season's year, with a fallback to the current calendar year while
 * loading or when no season / backend is configured (keeps the UI previewable).
 */
export function useSeasonYear(): number {
    const { data } = useActiveSeason();
    return data?.year ?? CURRENT_YEAR;
}

/**
 * Drives the leaderboard year selector: the list of configured season years
 * (ascending) and the default year (active season). Falls back to the current
 * calendar year when no season exists.
 */
export function useSeasonYearTabs(): { years: number[]; defaultYear: number } {
    const { data } = useSeasons();
    const defaultYear = useSeasonYear();
    const years = (data ?? []).map((s) => s.year).sort((a, b) => a - b);
    return {
        years: years.length ? years : [defaultYear],
        defaultYear,
    };
}

// --- Notifications ---

/** The current user's notifications (newest first). Gated on a resolved user. */
export function useNotifications() {
    const api = useApiClient();
    const { user } = useCurrentUser();
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: () => api.get<ApiNotification[]>('/notifications'),
        enabled: !!user,
    });
}

/** Unread notification count for the bell badge. Polls while signed in. */
export function useUnreadNotificationsCount() {
    const api = useApiClient();
    const { user } = useCurrentUser();
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: () => api.get<UnreadCountDto>('/notifications/unread-count'),
        enabled: !!user,
        refetchInterval: 30_000,
    });
}

/** Mark every notification as read (clears the bell badge). */
export function useMarkNotificationsRead() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.post<null>('/notifications/read'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/** Delete a single notification. */
export function useDeleteNotification() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete<null>(`/notifications/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/** Clear all of the current user's notifications. */
export function useClearNotifications() {
    const api = useApiClient();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.delete<null>('/notifications'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
