/**
 * Domain event names + payloads consumed by the NotificationsService. Domain
 * modules import only these constants/types (no DI) to emit, which keeps the
 * dependency one-directional: nothing depends on NotificationsModule.
 */
export const NotificationEvents = {
    /** A tracked celebrity was newly recorded as deceased. */
    CelebrityDied: 'celebrity.died',
    /** A user joined a circle (excludes the circle creator's own membership). */
    MembershipCreated: 'membership.created',
    /** A season's betting window just opened. */
    SeasonBetsOpened: 'season.betsOpened',
    /** A season just opened (now ≥ openDate). */
    SeasonOpened: 'season.opened',
    /** A season just closed (now ≥ closeDate). */
    SeasonClosed: 'season.closed',
    /** A player proposed a missing celebrity (still PENDING admin validation). */
    ProposalPending: 'proposal.pending',
    /** An admin approved a player's celebrity proposal. */
    ProposalApproved: 'proposal.approved',
    /** An admin rejected a player's celebrity proposal. */
    ProposalRejected: 'proposal.rejected',
    /** A brand-new user row was provisioned (first sign-in). */
    UserWelcomed: 'user.welcomed',
    /** A season's betting window is about to close (reminder). */
    BetsClosingSoon: 'bets.closingSoon',
} as const;

/** Payload for the proposal lifecycle events. */
export interface ProposalEvent {
    celebrityId: string;
    celebrityName: string;
    /** The proposer's User.id (null for admin/legacy rows — no proposer to notify). */
    proposerId: string | null;
}

export interface UserWelcomedEvent {
    userId: string;
}

export interface CelebrityDiedEvent {
    celebrityId: string;
    /** Year of death — only bets of this year scored the pick (and get notified). */
    deathYear: number;
}

export interface MembershipCreatedEvent {
    circleId: string;
    /** The user who just joined (excluded from the recipients). */
    userId: string;
}

export interface SeasonMilestoneEvent {
    seasonId: string;
    year: number;
}
