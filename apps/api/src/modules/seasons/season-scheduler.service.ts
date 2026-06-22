import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import type { Season, SeasonMilestone } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEvents, type SeasonMilestoneEvent } from '../notifications/events';

/** Milestones in chronological order; the index+1 is the monotonic rank. */
const ORDERED: SeasonMilestone[] = ['BETS_OPEN', 'SEASON_OPENED', 'CLOSED'];

const EVENT_BY_MILESTONE: Record<SeasonMilestone, string> = {
    BETS_OPEN: NotificationEvents.SeasonBetsOpened,
    SEASON_OPENED: NotificationEvents.SeasonOpened,
    CLOSED: NotificationEvents.SeasonClosed,
};

/** How long before betEndDate the "betting closes soon" reminder fires. */
const CLOSING_REMINDER_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/**
 * Daily watcher that turns date-based season transitions into events. Each
 * season carries a `notifiedMilestone` cursor; when "now" crosses a later
 * milestone (bets open → season open → closed) the scheduler emits the
 * corresponding event(s) and advances the cursor, so every milestone fires its
 * notification exactly once. On a season's first observation past a milestone
 * (cursor still null) only the *current* milestone fires — past milestones are
 * not replayed (avoids spam when the feature ships mid-season).
 */
@Injectable()
export class SeasonSchedulerService {
    private readonly logger = new Logger('SeasonScheduler');

    constructor(
        private prisma: PrismaService,
        private events: EventEmitter2,
    ) {}

    // 5am, after the 4am death scan.
    @Cron('0 5 * * *')
    async scheduled(): Promise<void> {
        await this.run();
    }

    /** Checks every season and emits any newly-crossed milestone. */
    async run(): Promise<void> {
        const seasons = await this.prisma.season.findMany();
        const now = Date.now();
        for (const season of seasons) {
            try {
                await this.processSeason(season, now);
                await this.processClosingReminder(season, now);
            } catch (error) {
                this.logger.error(`Season ${season.year} scheduling failed`, error as Error);
            }
        }
    }

    /**
     * Fires the "betting closes soon" reminder once, when betEndDate is within
     * {@link CLOSING_REMINDER_MS} and the betting window is still open.
     */
    private async processClosingReminder(season: Season, now: number): Promise<void> {
        if (season.betsClosingNotifiedAt) return; // already reminded
        const end = season.betEndDate.getTime();
        const inWindow = now >= season.betStartDate.getTime() && now <= end;
        if (!inWindow || end - now > CLOSING_REMINDER_MS) return;

        this.events.emit(NotificationEvents.BetsClosingSoon, {
            seasonId: season.id,
            year: season.year,
        } satisfies SeasonMilestoneEvent);

        await this.prisma.season.update({
            where: { id: season.id },
            data: { betsClosingNotifiedAt: new Date() },
        });
    }

    private async processSeason(season: Season, now: number): Promise<void> {
        const targetRank = this.reachedRank(season, now);
        if (targetRank === 0) return; // before the betting window — nothing yet

        const storedRank = season.notifiedMilestone
            ? ORDERED.indexOf(season.notifiedMilestone) + 1
            : 0;
        if (targetRank <= storedRank) return; // already up to date

        // First observation past a milestone: only fire the current one (don't
        // replay the whole history). Otherwise fire each step we just crossed.
        const from = storedRank === 0 ? targetRank : storedRank + 1;
        const payload: SeasonMilestoneEvent = { seasonId: season.id, year: season.year };
        for (let rank = from; rank <= targetRank; rank += 1) {
            this.events.emit(EVENT_BY_MILESTONE[ORDERED[rank - 1]], payload);
        }

        await this.prisma.season.update({
            where: { id: season.id },
            data: { notifiedMilestone: ORDERED[targetRank - 1] },
        });
    }

    /** Highest milestone rank reached at `now` (0 = before betting starts). */
    private reachedRank(season: Season, now: number): number {
        if (now >= season.closeDate.getTime()) return 3;
        if (now >= season.openDate.getTime()) return 2;
        if (now >= season.betStartDate.getTime()) return 1;
        return 0;
    }
}
