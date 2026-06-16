// Maps API DTOs (Api*) to the UI domain types consumed by the screens. Keeps the
// transformation in one place so routes only deal with view models.

import type { CelebrityStatus } from '@/types/celebrity';
import type {
    CircleMember,
    CircleSummary,
    HubCircle,
    MemberRole,
    PodiumSlot,
} from '@/types/circle';
import type { DeathFeedEntry } from '@/types/feed';
import type { LeaderboardEntry, LeaderPick } from '@/types/leaderboard';
import type { AvatarPerson } from '@/types/user';
import type {
    ApiMembership,
    ApiUser,
    CircleSummaryDto,
    DeathFeedEntryDto,
    MembershipRole,
    PodiumSlotDto,
    RankedBet,
} from './types';

/** Two-letter initials from a display name. */
export function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Best display name for a user (username → full name → email local part). */
export function userDisplayName(
    user: Pick<ApiUser, 'username' | 'firstname' | 'lastname' | 'email'>,
): string {
    if (user.username) return user.username;
    const full = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
    if (full) return full;
    if (user.email) return user.email.split('@')[0];
    return 'Joueur';
}

/** Lowercase in-circle role for the UI. */
export function toMemberRole(role: MembershipRole): MemberRole {
    return role === 'ADMIN' ? 'admin' : 'member';
}

/** A `@handle` from a username, falling back to a slug of the display name. */
function handleOf(user: Pick<ApiUser, 'username'>, name: string): string {
    const raw = user.username ?? name;
    const slug = raw
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    return `@${slug || 'joueur'}`;
}

/**
 * Membership + optional ranked bet → member roster row. `ranked` carries
 * rank/points (0 when the member has no bet this year). `currentUserId` marks
 * the "you" row; `creatorUserId` flags the circle creator (earliest admin).
 */
export function toCircleMember(
    membership: ApiMembership,
    ranked: RankedBet | undefined,
    currentUserId: string | undefined,
    creatorUserId: string | undefined,
): CircleMember {
    const user = membership.user as ApiUser;
    const name = userDisplayName(user);
    return {
        id: user.id,
        name,
        handle: handleOf(user, name),
        initials: initialsOf(name),
        rank: ranked?.rank ?? 0,
        points: ranked?.total ?? 0,
        role: toMemberRole(membership.role),
        isYou: user.id === currentUserId,
        isCreator: user.id === creatorUserId,
    };
}

/** Full years between two ISO dates. */
export function yearsBetween(fromIso: string, toIso: string): number {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    let age = to.getUTCFullYear() - from.getUTCFullYear();
    const m = to.getUTCMonth() - from.getUTCMonth();
    if (m < 0 || (m === 0 && to.getUTCDate() < from.getUTCDate())) age -= 1;
    return age;
}

/** French month-year label for an ISO date, e.g. "déc. 2024". */
export function monthYearLabel(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(
        new Date(iso),
    );
}

/** Relative French label for a past ISO date, e.g. "il y a 2 j". */
export function relativeDayLabel(iso: string, now = new Date()): string {
    const then = new Date(iso);
    const days = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
    if (days <= 0) return "aujourd'hui";
    if (days === 1) return 'hier';
    return `il y a ${days} j`;
}

function toPodiumSlot(slot: PodiumSlotDto): PodiumSlot {
    return {
        place: slot.place,
        name: slot.isYou ? 'Vous' : slot.name,
        initials: initialsOf(slot.name),
        points: slot.points,
        ring: slot.isYou ? 'neon' : slot.place === 1 ? 'mag' : undefined,
    };
}

function toAvatarPerson(slot: PodiumSlotDto): AvatarPerson {
    return {
        id: slot.userId,
        initials: initialsOf(slot.name),
        ring: slot.isYou ? 'neon' : slot.place === 1 ? 'mag' : undefined,
    };
}

/** Circle summary → "Mes cercles" hub card. */
export function toHubCircle(dto: CircleSummaryDto): HubCircle {
    const rankState = dto.myRank === 1 ? 'lead' : dto.myRank > 0 && dto.myRank <= 3 ? 'mid' : 'low';
    return {
        id: dto.id,
        name: dto.name,
        visibility: dto.visibility,
        members: dto.members,
        myRank: dto.myRank > 0 ? `#${dto.myRank}` : '—',
        rankState,
        tag: dto.isLeader ? 'En tête' : undefined,
        points: dto.myPoints,
        podium: dto.podium.map(toPodiumSlot),
    };
}

/** Circle summary → dashboard circle card. */
export function toCircleSummary(dto: CircleSummaryDto): CircleSummary {
    return {
        id: dto.id,
        name: dto.name,
        visibility: dto.visibility,
        members: dto.members,
        rank: dto.myRank,
        points: dto.myPoints,
        isLeader: dto.isLeader,
        topMembers: dto.podium.map(toAvatarPerson),
    };
}

/** Ranked bet → circle leaderboard row. `currentUserId` marks the "you" row. */
export function toLeaderboardEntry(bet: RankedBet, currentUserId?: string): LeaderboardEntry {
    const name = userDisplayName(bet.user);
    return {
        id: bet.id,
        name,
        initials: initialsOf(name),
        rank: bet.rank,
        points: bet.total,
        hits: bet.deathCount,
        bets: bet.CelebritiesOnBet.length,
        isYou: bet.userId === currentUserId,
    };
}

const celebrityStatus = (death: string | null): CelebrityStatus => (death ? 'deceased' : 'alive');

/** The picks of a single bet (used to show the leader's roster). */
export function toLeaderPicks(bet: RankedBet): LeaderPick[] {
    return bet.CelebritiesOnBet.map((c) => ({
        id: c.celebrityId,
        name: c.celebrity.name,
        role: '',
        status: celebrityStatus(c.celebrity.death),
        points: c.celebrity.death ? c.points : undefined,
    }));
}

/** Death feed DTO → dashboard feed item. */
export function toDeathFeedEntry(dto: DeathFeedEntryDto): DeathFeedEntry {
    return {
        id: dto.celebrityId,
        celebrityName: dto.celebrityName,
        age: dto.age,
        scorers: dto.scorers,
        when: relativeDayLabel(dto.death),
        points: dto.points,
    };
}
