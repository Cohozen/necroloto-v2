import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import type { SubscribeDto } from './dto/subscribe.dto';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:contact@necroloto.app';

/** Notification payload delivered to the service worker (`push` event). */
export interface PushPayload {
    title: string;
    body: string;
    url?: string;
    data?: Record<string, unknown>;
}

/**
 * Web Push delivery. Stores browser subscriptions and pushes notifications to
 * them via VAPID. **No-op when VAPID keys are absent** (keeps the app deployable
 * without push config, like ADMIN_CLERK_IDS). Dead endpoints (404/410) are
 * pruned on send.
 */
@Injectable()
export class PushService implements OnModuleInit {
    private readonly logger = new Logger('Push');
    private enabled = false;

    constructor(private prisma: PrismaService) {}

    onModuleInit(): void {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            this.logger.warn('VAPID keys missing — web push is disabled.');
            return;
        }
        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        this.enabled = true;
    }

    /** The VAPID public key the browser needs to subscribe (empty when disabled). */
    getPublicKey(): { publicKey: string } {
        return { publicKey: VAPID_PUBLIC_KEY };
    }

    /** Stores (or refreshes) a browser subscription for the current user. */
    async subscribe(
        clerkId: string | undefined,
        dto: SubscribeDto,
        userAgent?: string,
    ): Promise<void> {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return;
        await this.prisma.pushSubscription.upsert({
            where: { endpoint: dto.endpoint },
            create: {
                userId,
                endpoint: dto.endpoint,
                p256dh: dto.keys.p256dh,
                auth: dto.keys.auth,
                userAgent,
            },
            update: { userId, p256dh: dto.keys.p256dh, auth: dto.keys.auth, userAgent },
        });
    }

    /** Removes a subscription by endpoint (ownership enforced via the user). */
    async unsubscribe(clerkId: string | undefined, endpoint: string): Promise<void> {
        const userId = await this.resolveUserId(clerkId);
        if (!userId) return;
        await this.prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
    }

    /**
     * Pushes a notification to every subscription of the given users. Best-effort
     * and fire-and-forget: each send is isolated, and gone endpoints (404/410)
     * are pruned. Never throws — a push failure must not break the caller.
     */
    async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
        if (!this.enabled || userIds.length === 0) return;
        try {
            const subs = await this.prisma.pushSubscription.findMany({
                where: { userId: { in: userIds } },
            });
            if (subs.length === 0) return;

            const body = JSON.stringify(payload);
            const stale: string[] = [];
            await Promise.all(
                subs.map(async (sub) => {
                    try {
                        await webpush.sendNotification(
                            {
                                endpoint: sub.endpoint,
                                keys: { p256dh: sub.p256dh, auth: sub.auth },
                            },
                            body,
                        );
                    } catch (error) {
                        const status = (error as { statusCode?: number }).statusCode;
                        if (status === 404 || status === 410) {
                            stale.push(sub.endpoint);
                        } else {
                            this.logger.warn(
                                `push send failed (${status ?? '?'}) for ${sub.endpoint}`,
                            );
                        }
                    }
                }),
            );

            if (stale.length > 0) {
                await this.prisma.pushSubscription.deleteMany({
                    where: { endpoint: { in: stale } },
                });
            }
        } catch (error) {
            this.logger.error('sendToUsers failed', error as Error);
        }
    }

    private resolveUserId(clerkId: string | undefined): Promise<string | null> {
        if (!clerkId) return Promise.resolve(null);
        return this.prisma.user
            .findUnique({ where: { clerkId }, select: { id: true } })
            .then((u) => u?.id ?? null);
    }
}
