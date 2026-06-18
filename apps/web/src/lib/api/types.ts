// Hand-written DTOs mirroring the NestJS API responses (Prisma entities). The API
// has no Swagger, so these are maintained by hand. Dates are serialized as ISO
// strings over the wire. Enums mirror `@necroloto/shared` / the Prisma schema.

import type { CircleVisibility } from '@/types/circle';

export type { CircleVisibility };
export type CircleStatus = 'OPEN' | 'LOCKED' | 'ARCHIVED';
export type MembershipRole = 'ADMIN' | 'MEMBER';

/** Leaderboard sort, mirrors the API's `sort` query param. */
export type SortByRank = 'points' | 'death';

export interface ApiUser {
    id: string;
    clerkId: string;
    email: string | null;
    image: string | null;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    clerkCreatedAt: string;
    clerkUpdatedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiCelebrity {
    id: string;
    name: string;
    birth: string | null;
    death: string | null;
    photo: string | null;
    wikidataId: string | null;
    role: string | null;
    category: string | null;
}

export interface ApiCelebritiesOnBet {
    betId: string;
    celebrityId: string;
    points: number;
    createdAt: string;
    updatedAt: string;
    celebrity: ApiCelebrity;
}

/** One bet listing a celebrity, with its author + circle (celebrity detail). */
export interface ApiBettorEntry {
    betId: string;
    celebrityId: string;
    points: number;
    bet: {
        id: string;
        userId: string;
        circleId: string | null;
        year: number;
        user: ApiUser;
        Circle: ApiCircle | null;
    };
}

/** Celebrity detail (GET /celebrities/:id) — bets enriched with user + circle. */
export interface ApiCelebrityDetail extends ApiCelebrity {
    CelebritiesOnBet: ApiBettorEntry[];
}

/** Celebrity list item (GET /celebrities) — bet join rows for counting bettors. */
export interface ApiCelebrityListItem extends ApiCelebrity {
    CelebritiesOnBet: { points: number }[];
}

/** Admin catalogue status filter (GET /celebrities/admin/list). */
export type AdminCelebrityStatus = 'all' | 'alive' | 'deceased';

/** Result of a bulk delete (DELETE /celebrities/bulk). */
export interface BulkDeleteResult {
    deleted: number;
}

/** Result of a bulk Wikidata enrich (POST /celebrities/bulk/enrich). */
export interface BulkEnrichResult {
    results: { id: string; success: boolean; error?: string }[];
}

/** One page of the admin catalogue (GET /celebrities/admin/list). */
export interface AdminCelebrityPage {
    items: ApiCelebrityListItem[];
    total: number;
}

/** A Wikidata candidate (GET /celebrities/wikidata/search). Dates are ISO strings. */
export interface WikidataSummaryDto {
    wikidataId: string;
    label: string;
    description?: string;
    birth?: string;
    death?: string;
    photoFilename?: string;
    isHuman: boolean;
}

export interface ApiBet {
    id: string;
    userId: string;
    circleId: string | null;
    year: number;
    createdAt: string;
    updatedAt: string;
    user: ApiUser;
    Circle: ApiCircle | null;
    CelebritiesOnBet: ApiCelebritiesOnBet[];
}

/** A bet enriched with ranking, as returned by `GET /bets/circle/:id/rank`. */
export interface RankedBet extends ApiBet {
    rank: number;
    total: number;
    deathCount: number;
}

export interface ApiMembership {
    id: string;
    userId: string;
    circleId: string;
    role: MembershipRole;
    joinedAt: string;
    user?: ApiUser;
    circle?: ApiCircle;
}

export interface ApiCircle {
    id: string;
    name: string;
    visibility: CircleVisibility;
    status: CircleStatus;
    code: string | null;
    allowNewBet: boolean;
    allowEdit: boolean;
    betsVisible: boolean;
    createdAt: string;
    updatedAt: string;
    memberships?: ApiMembership[];
    bets?: ApiBet[];
}

// --- Aggregate DTOs (custom endpoints added for the front) ---

/** One podium slot in a circle summary (top 3, ordered by place). */
export interface PodiumSlotDto {
    place: 1 | 2 | 3;
    userId: string;
    name: string;
    points: number;
    /** True when this slot is the requesting user. */
    isYou: boolean;
}

/** Per-circle summary for a user, from `GET /circle/user/:userId/summary`. */
export interface CircleSummaryDto {
    id: string;
    name: string;
    visibility: CircleVisibility;
    members: number;
    /** My rank in the circle (0 if I have no bet this year). */
    myRank: number;
    myPoints: number;
    isLeader: boolean;
    /** Whether members may still edit their bet list (gates the draft). */
    allowEdit: boolean;
    /** Whether new bets may still be created in this circle. */
    allowNewBet: boolean;
    /** Whether the season's betting window is currently open for this year. */
    bettingOpen: boolean;
    podium: PodiumSlotDto[];
}

/** A season (GET /seasons). Dates are ISO strings over the wire. */
export interface ApiSeason {
    id: string;
    year: number;
    name: string | null;
    openDate: string;
    betStartDate: string;
    betEndDate: string;
    closeDate: string;
    createdAt: string;
    updatedAt: string;
}

/** A recent celebrity death, from `GET /celebrities/deaths/feed`. */
export interface DeathFeedEntryDto {
    celebrityId: string;
    celebrityName: string;
    age: number;
    /** ISO death date. */
    death: string;
    /** Number of bets that scored from this death. */
    scorers: number;
    /** Total points awarded across all scoring bets. */
    points: number;
}

// --- Request payloads ---

export interface CreateUserPayload {
    clerkId: string;
    email?: string;
    image?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
}

export interface CreateCirclePayload {
    name: string;
    visibility?: CircleVisibility;
    allowNewBet: boolean;
    /** Clerk-resolved creator user id; the API adds the ADMIN membership. */
    creatorUserId: string;
}

export interface CreateMembershipPayload {
    userId: string;
    circleId: string;
    role?: MembershipRole;
}

export interface UpdateUserPayload {
    username?: string | null;
    firstname?: string;
    lastname?: string;
}

export interface UpdateCirclePayload {
    name?: string;
    visibility?: CircleVisibility;
    allowNewBet?: boolean;
    allowEdit?: boolean;
    betsVisible?: boolean;
}

export interface UpdateMemberRolePayload {
    role: MembershipRole;
}

export interface CreateBetPayload {
    userId: string;
    year: number;
    circleId?: string;
    celebrityIds?: string[];
}

export interface ReplaceCelebritiesPayload {
    /** Celebrity ids, existing names, or new names to create on the fly. */
    celebrities: string[];
}

export interface CreateCelebrityPayload {
    name: string;
    /** ISO date strings (full ISO-8601 — only the date part is stored); null clears. */
    birth?: string | null;
    death?: string | null;
    role?: string | null;
    category?: string;
}

export type UpdateCelebrityPayload = Partial<CreateCelebrityPayload>;

export interface EnrichCelebrityPayload {
    /** Explicit Wikidata QID; the API falls back to the existing link or name. */
    wikidataId?: string;
}

export interface CreateSeasonPayload {
    year: number;
    name?: string | null;
    /** ISO date-time strings. */
    openDate: string;
    betStartDate: string;
    betEndDate: string;
    closeDate: string;
}

export type UpdateSeasonPayload = Partial<CreateSeasonPayload>;
