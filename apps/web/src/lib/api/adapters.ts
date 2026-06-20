// Maps API DTOs (Api*) to the UI domain types consumed by the screens. Keeps the
// transformation in one place so routes only deal with view models.

import { calculPointByCelebrity } from '@necroloto/shared/scoring';
import type { AdminCelebrity } from '@/types/admin';
import type {
    Bettor,
    CelebrityDetail,
    CelebrityProposalStatus,
    CelebrityStatus,
    CelebritySummary,
} from '@/types/celebrity';
import type {
    CircleMember,
    CircleSummary,
    HubCircle,
    MemberRole,
    PodiumSlot,
} from '@/types/circle';
import type { DeathFeedEntry } from '@/types/feed';
import type { LeaderboardEntry, LeaderPick } from '@/types/leaderboard';
import type { Season, SeasonStatus } from '@/types/season';
import type { AvatarPerson } from '@/types/user';
import type {
    ApiBet,
    ApiCelebrity,
    ApiCelebrityDetail,
    ApiCelebrityListItem,
    ApiMembership,
    ApiSeason,
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

const proposalStatus = (status: ApiCelebrity['status']): CelebrityProposalStatus =>
    status === 'PENDING' ? 'pending' : status === 'REJECTED' ? 'rejected' : 'approved';

/**
 * API celebrity list item → admin catalogue row. `bettors` counts the bet join
 * rows; `points` uses the shared scoring (awarded if dead, else potential value).
 */
export function toAdminCelebrity(c: ApiCelebrityListItem): AdminCelebrity {
    return {
        id: c.id,
        name: c.name,
        role: c.role ?? '',
        born: c.birth ? new Date(c.birth).getUTCFullYear() : 0,
        status: celebrityStatus(c.death),
        proposalStatus: proposalStatus(c.status),
        hasWikidata: !!c.wikidataId,
        points: celebrityPoints(c),
        bettors: c.CelebritiesOnBet.length,
    };
}

/** API celebrity → catalogue card view model. Age/born derived from `birth`. */
export function toCelebritySummary(c: ApiCelebrity): CelebritySummary {
    const bornYear = c.birth ? new Date(c.birth).getUTCFullYear() : 0;
    const age = c.birth ? yearsBetween(c.birth, c.death ?? new Date().toISOString()) : 0;
    return {
        id: c.id,
        name: c.name,
        age,
        born: bornYear,
        role: c.role ?? undefined,
        status: celebrityStatus(c.death),
        proposalStatus: proposalStatus(c.status),
        category: c.category ?? undefined,
    };
}

/** French long date, e.g. "12 mars 2026". */
function longDateLabel(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));
}

/**
 * Celebrity points: awarded points if deceased, else the potential value if they
 * died at the end of the current year. Uses the shared scoring source of truth.
 */
function celebrityPoints(c: Pick<ApiCelebrity, 'birth' | 'death'>): number {
    if (!c.birth) return 0;
    const birth = new Date(c.birth);
    const death = c.death
        ? new Date(c.death)
        : new Date(Date.UTC(new Date().getFullYear(), 11, 31));
    return calculPointByCelebrity(birth, death);
}

/**
 * API celebrity detail → fiche view model. Bettors are limited to bets placed in
 * one of the viewer's circles (`myCircleIds`); `currentUserId` marks your row.
 */
export function toCelebrityDetail(
    c: ApiCelebrityDetail,
    myCircleIds: Set<string>,
    currentUserId: string | undefined,
): CelebrityDetail {
    const dead = !!c.death;
    const points = celebrityPoints(c);
    const summary = toCelebritySummary(c);

    const bettors: Bettor[] = c.CelebritiesOnBet.filter(
        (e) => e.bet.circleId && myCircleIds.has(e.bet.circleId),
    ).map((e) => {
        const isYou = e.bet.userId === currentUserId;
        const name = userDisplayName(e.bet.user);
        return {
            id: e.bet.id,
            name: isYou ? 'Vous' : name,
            initials: isYou ? 'ME' : initialsOf(name),
            circle: e.bet.Circle?.name ?? '—',
            isYou,
            points: dead ? e.points : points,
        };
    });

    return {
        id: c.id,
        name: c.name,
        role: c.role ?? undefined,
        category: c.category ?? undefined,
        born: summary.born,
        age: summary.age,
        status: dead ? 'deceased' : 'alive',
        deathLabel: c.death ? longDateLabel(c.death) : undefined,
        points,
        bettors,
    };
}

/** The picks of a single bet (used to show a player's roster). */
export function toLeaderPicks(bet: ApiBet): LeaderPick[] {
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

/** Lifecycle status of a season at a given instant (defaults to now). */
export function seasonStatus(season: ApiSeason, now: number = Date.now()): SeasonStatus {
    const open = new Date(season.openDate).getTime();
    const betStart = new Date(season.betStartDate).getTime();
    const betEnd = new Date(season.betEndDate).getTime();
    const close = new Date(season.closeDate).getTime();
    // Betting happens before the season opens, so test bets-open / closed before
    // upcoming — otherwise the (pre-open) betting window reads as "upcoming".
    if (now >= betStart && now <= betEnd) return 'bets-open';
    if (now > close) return 'closed';
    if (now >= open && now <= close) return 'open';
    return 'upcoming';
}

/** Target of the dashboard countdown: the bet window opening or closing. */
export type CountdownTarget = {
    season: ApiSeason;
    /** `opening` → counting to betStartDate, `closing` → counting to betEndDate. */
    mode: 'opening' | 'closing';
    /** Deadline in ms epoch (betStartDate for `opening`, betEndDate for `closing`). */
    deadline: number;
};

/**
 * Picks what the dashboard countdown should target, mirroring the season phase
 * logic (`seasonStatus` / API `getSeasonPhase`):
 *  1) a season whose bet window is open now (betStart ≤ now ≤ betEnd) → its end,
 *  2) else the nearest upcoming bet window (smallest betStart > now) → its start,
 *  3) else null (nothing to count down → the card is hidden).
 */
export function nextCountdownTarget(
    seasons: ApiSeason[] | undefined,
    now: number = Date.now(),
): CountdownTarget | null {
    if (!seasons?.length) return null;
    const betting = seasons.find((s) => {
        const start = new Date(s.betStartDate).getTime();
        const end = new Date(s.betEndDate).getTime();
        return now >= start && now <= end;
    });
    if (betting) {
        return {
            season: betting,
            mode: 'closing',
            deadline: new Date(betting.betEndDate).getTime(),
        };
    }
    const upcoming = seasons
        .filter((s) => new Date(s.betStartDate).getTime() > now)
        .sort((a, b) => new Date(a.betStartDate).getTime() - new Date(b.betStartDate).getTime())[0];
    if (upcoming) {
        return {
            season: upcoming,
            mode: 'opening',
            deadline: new Date(upcoming.betStartDate).getTime(),
        };
    }
    return null;
}

/**
 * Whether other members' bets are revealed for a season: once it has opened
 * (now ≥ openDate). No season → true (V1 compat). Mirrors the API `isRevealed`.
 */
export function isSeasonRevealed(season: ApiSeason | undefined, now: number = Date.now()): boolean {
    if (!season) return true;
    return now >= new Date(season.openDate).getTime();
}

/** Season DTO → UI view model with a derived status. */
export function toSeason(dto: ApiSeason): Season {
    return {
        id: dto.id,
        year: dto.year,
        name: dto.name,
        openDate: dto.openDate,
        betStartDate: dto.betStartDate,
        betEndDate: dto.betEndDate,
        closeDate: dto.closeDate,
        status: seasonStatus(dto),
    };
}
