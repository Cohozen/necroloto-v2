import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type NotificationType, Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BetsService } from '../bets/bets.service';
import {
    type CelebrityDiedEvent,
    type MembershipCreatedEvent,
    NotificationEvents,
    type ProposalEvent,
    type SeasonMilestoneEvent,
    type UserWelcomedEvent,
} from './events';

/** Clerk ids of global admins (CSV env), resolved to User rows for admin-targeted notifications. */
const ADMIN_CLERK_IDS = (process.env.ADMIN_CLERK_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** How many notifications the list endpoint returns (newest first). */
const LIST_LIMIT = 50;

interface NewNotification {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger('Notifications');

    constructor(
        private prisma: PrismaService,
        private bets: BetsService,
    ) {}

    // --- Read/write API (controller) -----------------------------------------

    /** The current user's latest notifications, newest first. */
    async listForUser(clerkId: string | undefined) {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return [];
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: LIST_LIMIT,
        });
    }

    /** Number of unread notifications — drives the bell badge. */
    async unreadCount(clerkId: string | undefined): Promise<{ count: number }> {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return { count: 0 };
        const count = await this.prisma.notification.count({
            where: { userId, readAt: null },
        });
        return { count };
    }

    /** Marks every unread notification of the user as read. */
    async markAllRead(clerkId: string | undefined): Promise<void> {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return;
        await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }

    /** Deletes one notification, enforcing ownership. */
    async remove(clerkId: string | undefined, id: string): Promise<void> {
        const userId = await this.resolveUserId(clerkId);
        const notification = await this.prisma.notification.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!notification) throw new NotFoundException('Notification introuvable.');
        if (!userId || notification.userId !== userId) {
            throw new ForbiddenException('Cette notification ne vous appartient pas.');
        }
        await this.prisma.notification.delete({ where: { id } });
    }

    /** Clears all of the user's notifications. */
    async clear(clerkId: string | undefined): Promise<void> {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return;
        await this.prisma.notification.deleteMany({ where: { userId } });
    }

    // --- Event handlers (async, fire-and-forget) -----------------------------

    /** Notifies every bettor whose bet of the death year included the celebrity. */
    @OnEvent(NotificationEvents.CelebrityDied)
    async onCelebrityDied({ celebrityId, deathYear }: CelebrityDiedEvent): Promise<void> {
        try {
            const celebrity = await this.prisma.celebrity.findUnique({
                where: { id: celebrityId },
                select: { name: true },
            });
            if (!celebrity) return;

            const bets = await this.prisma.bet.findMany({
                where: { year: deathYear, CelebritiesOnBet: { some: { celebrityId } } },
                select: { userId: true },
                distinct: ['userId'],
            });

            await this.createMany(
                bets.map(({ userId }) => ({
                    userId,
                    type: 'CELEBRITY_DEATH',
                    title: `${celebrity.name} est décédé·e`,
                    body: `Une de vos célébrités pariées pour ${deathYear} vient de marquer des points.`,
                    data: { celebrityId, year: deathYear },
                })),
            );
        } catch (error) {
            this.logger.error(`celebrity.died handler failed for ${celebrityId}`, error as Error);
        }
    }

    /** Notifies the existing members of a circle that someone joined. */
    @OnEvent(NotificationEvents.MembershipCreated)
    async onMembershipCreated({ circleId, userId }: MembershipCreatedEvent): Promise<void> {
        try {
            const circle = await this.prisma.circle.findUnique({
                where: { id: circleId },
                select: { name: true },
            });
            if (!circle) return;

            const joiner = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, firstname: true },
            });
            const joinerName = joiner?.username || joiner?.firstname || 'Un nouveau joueur';

            const members = await this.prisma.membership.findMany({
                where: { circleId, userId: { not: userId } },
                select: { userId: true },
            });

            await this.createMany(
                members.map((m) => ({
                    userId: m.userId,
                    type: 'CIRCLE_NEW_MEMBER',
                    title: `Nouveau membre dans ${circle.name}`,
                    body: `${joinerName} a rejoint le cercle.`,
                    data: { circleId },
                })),
            );
        } catch (error) {
            this.logger.error(`membership.created handler failed for ${circleId}`, error as Error);
        }
    }

    @OnEvent(NotificationEvents.SeasonBetsOpened)
    onSeasonBetsOpened(event: SeasonMilestoneEvent): Promise<void> {
        return this.notifyCircleMembers(
            'SEASON_BETS_OPEN',
            `Les paris ${event.year} sont ouverts`,
            'La période de paris vient de commencer : composez votre liste.',
            event,
        );
    }

    @OnEvent(NotificationEvents.SeasonOpened)
    onSeasonOpened(event: SeasonMilestoneEvent): Promise<void> {
        return this.notifyCircleMembers(
            'SEASON_OPENED',
            `La saison ${event.year} est ouverte`,
            'Les paris sont désormais révélés et le décompte des points a commencé.',
            event,
        );
    }

    @OnEvent(NotificationEvents.SeasonClosed)
    onSeasonClosed(event: SeasonMilestoneEvent): Promise<void> {
        return this.notifyCircleMembers(
            'SEASON_CLOSED',
            `La saison ${event.year} est terminée`,
            'Rendez-vous sur le classement final pour découvrir les résultats.',
            event,
        );
    }

    /** On season close, announce each circle's winner (the rank-1 bet of the year). */
    @OnEvent(NotificationEvents.SeasonClosed)
    async onSeasonClosedWinners({ year }: SeasonMilestoneEvent): Promise<void> {
        try {
            const circles = await this.prisma.circle.findMany({
                where: { bets: { some: { year } } },
                select: { id: true, name: true },
            });

            for (const circle of circles) {
                const ranked = await this.bets.rankByYearAndCircle(circle.id, year);
                const winner = ranked.find((b) => b.rank === 1);
                if (!winner) continue;
                const winnerName = winner.user?.username || winner.user?.firstname || 'Un joueur';

                const members = await this.prisma.membership.findMany({
                    where: { circleId: circle.id },
                    select: { userId: true },
                });

                await this.createMany(
                    members.map((m) => ({
                        userId: m.userId,
                        type: 'SEASON_WINNER' as const,
                        title:
                            m.userId === winner.userId
                                ? `🏆 Vous remportez la saison ${year} !`
                                : `${winnerName} remporte la saison ${year}`,
                        body: `Classement final du cercle ${circle.name}.`,
                        data: { circleId: circle.id, year },
                    })),
                );
            }
        } catch (error) {
            this.logger.error(`season winner handler failed for ${year}`, error as Error);
        }
    }

    /** Notifies the global admins that a new celebrity proposal awaits validation. */
    @OnEvent(NotificationEvents.ProposalPending)
    async onProposalPending({ celebrityId, celebrityName }: ProposalEvent): Promise<void> {
        try {
            if (ADMIN_CLERK_IDS.length === 0) return; // no admin recipients configured
            const admins = await this.prisma.user.findMany({
                where: { clerkId: { in: ADMIN_CLERK_IDS } },
                select: { id: true },
            });
            await this.createMany(
                admins.map(({ id }) => ({
                    userId: id,
                    type: 'CELEBRITY_PROPOSAL_PENDING' as const,
                    title: 'Nouvelle proposition à valider',
                    body: `${celebrityName} a été proposé·e par un joueur.`,
                    data: { celebrityId },
                })),
            );
        } catch (error) {
            this.logger.error(`proposal.pending handler failed for ${celebrityId}`, error as Error);
        }
    }

    /** Tells the proposer their celebrity proposal was approved. */
    @OnEvent(NotificationEvents.ProposalApproved)
    onProposalApproved(event: ProposalEvent): Promise<void> {
        return this.notifyProposer(
            event,
            'CELEBRITY_PROPOSAL_APPROVED',
            'Proposition acceptée',
            `${event.celebrityName} a été ajouté·e au catalogue.`,
        );
    }

    /** Tells the proposer their celebrity proposal was rejected. */
    @OnEvent(NotificationEvents.ProposalRejected)
    onProposalRejected(event: ProposalEvent): Promise<void> {
        return this.notifyProposer(
            event,
            'CELEBRITY_PROPOSAL_REJECTED',
            'Proposition refusée',
            `${event.celebrityName} n'a pas été retenu·e par les administrateurs.`,
        );
    }

    /** Greets a brand-new user on their first sign-in. */
    @OnEvent(NotificationEvents.UserWelcomed)
    async onUserWelcomed({ userId }: UserWelcomedEvent): Promise<void> {
        try {
            await this.create({
                userId,
                type: 'WELCOME',
                title: 'Bienvenue sur Necroloto 👋',
                body: 'Rejoignez un cercle et composez votre première liste pour entrer dans la partie.',
                data: {},
            });
        } catch (error) {
            this.logger.error(`user.welcomed handler failed for ${userId}`, error as Error);
        }
    }

    /** Reminds circle members who haven't placed a bet that betting closes soon. */
    @OnEvent(NotificationEvents.BetsClosingSoon)
    async onBetsClosingSoon({ year }: SeasonMilestoneEvent): Promise<void> {
        try {
            // Members of at least one circle who have no bet at all for the year.
            const users = await this.prisma.user.findMany({
                where: { Membership: { some: {} }, Bets: { none: { year } } },
                select: { id: true },
            });
            await this.createMany(
                users.map(({ id }) => ({
                    userId: id,
                    type: 'BET_CLOSING_SOON' as const,
                    title: `Les paris ${year} ferment bientôt`,
                    body: "Vous n'avez pas encore validé votre liste — il est encore temps !",
                    data: { year },
                })),
            );
        } catch (error) {
            this.logger.error(`bets.closingSoon handler failed for ${year}`, error as Error);
        }
    }

    // --- Internals -----------------------------------------------------------

    /** Notifies the proposer of a celebrity proposal (no-op for admin/legacy rows). */
    private async notifyProposer(
        { proposerId, celebrityId }: ProposalEvent,
        type: NotificationType,
        title: string,
        body: string,
    ): Promise<void> {
        try {
            if (!proposerId) return;
            await this.create({ userId: proposerId, type, title, body, data: { celebrityId } });
        } catch (error) {
            this.logger.error(`${type} handler failed for ${celebrityId}`, error as Error);
        }
    }

    /** Notifies every user with at least one circle membership (deduped). */
    private async notifyCircleMembers(
        type: NotificationType,
        title: string,
        body: string,
        { year }: SeasonMilestoneEvent,
    ): Promise<void> {
        try {
            const members = await this.prisma.membership.findMany({
                select: { userId: true },
                distinct: ['userId'],
            });
            await this.createMany(
                members.map(({ userId }) => ({ userId, type, title, body, data: { year } })),
            );
        } catch (error) {
            this.logger.error(`${type} handler failed for season ${year}`, error as Error);
        }
    }

    private async create(notification: NewNotification): Promise<void> {
        await this.prisma.notification.create({ data: notification });
    }

    private async createMany(notifications: NewNotification[]): Promise<void> {
        if (notifications.length === 0) return;
        await this.prisma.notification.createMany({ data: notifications });
    }

    private resolveUserId(clerkId: string | undefined): Promise<string | null> {
        if (!clerkId) return Promise.resolve(null);
        return this.prisma.user
            .findFirst({ where: { clerkId }, select: { id: true } })
            .then((u) => u?.id ?? null);
    }
}
