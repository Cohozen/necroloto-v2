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
}

export interface ApiCelebritiesOnBet {
    betId: string;
    celebrityId: string;
    points: number;
    createdAt: string;
    updatedAt: string;
    celebrity: ApiCelebrity;
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
    podium: PodiumSlotDto[];
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
