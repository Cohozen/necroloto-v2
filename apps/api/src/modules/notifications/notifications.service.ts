import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type NotificationType, Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    type CelebrityDiedEvent,
    type MembershipCreatedEvent,
    NotificationEvents,
    type SeasonMilestoneEvent,
} from './events';

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

    constructor(private prisma: PrismaService) {}

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

    // --- Internals -----------------------------------------------------------

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
