import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

/**
 * Date window of a season, used for validation/overlap checks. The global
 * ValidationPipe is transform-only (no `@Type(() => Date)`), so DTO dates reach
 * the service as ISO strings — `assertValid` coerces them with `new Date()`.
 */
interface SeasonWindow {
    openDate: Date | string;
    betStartDate: Date | string;
    betEndDate: Date | string;
    closeDate: Date | string;
}

/**
 * Lifecycle phase of a season at "now". Betting happens *before* the season
 * opens (paris ~1 month ahead), so the phases are not the naive date order.
 * `none` means no season row exists for the year → V1 compat (the per-circle
 * flags remain the only gate).
 */
export type SeasonPhase = 'none' | 'before' | 'betting' | 'season-open' | 'closed';

@Injectable()
export class SeasonsService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.season.findMany({ orderBy: { year: 'desc' } });
    }

    findOne(id: string) {
        return this.prisma.season.findUnique({ where: { id } });
    }

    /**
     * Active season, resolved with a "global switch" to the season currently
     * open for betting: betting happens before the season starts, so as soon as
     * season N+1's betting window opens the whole app should target N+1.
     * Priority: (1) season whose betting window is open now, (2) season whose
     * [openDate, closeDate] window contains now, (3) most recent by closeDate.
     * May be null when no season exists.
     */
    async getActive() {
        const now = new Date();
        const betting = await this.prisma.season.findFirst({
            where: { betStartDate: { lte: now }, betEndDate: { gte: now } },
            orderBy: { betStartDate: 'desc' },
        });
        if (betting) return betting;
        const current = await this.prisma.season.findFirst({
            where: { openDate: { lte: now }, closeDate: { gte: now } },
            orderBy: { closeDate: 'desc' },
        });
        if (current) return current;
        return this.prisma.season.findFirst({ orderBy: { closeDate: 'desc' } });
    }

    /** Year of the active season, falling back to the current UTC year (compat). */
    async getActiveYear(): Promise<number> {
        const active = await this.getActive();
        return active?.year ?? new Date().getUTCFullYear();
    }

    findByYear(year: number) {
        return this.prisma.season.findUnique({ where: { year } });
    }

    /**
     * Whether betting is currently open for a given year's season window.
     * Returns true when no season is configured for that year (compat): the
     * per-circle flags then remain the only gate.
     */
    async isBettingOpen(year: number): Promise<boolean> {
        const season = await this.findByYear(year);
        if (!season) return true;
        const now = Date.now();
        return now >= season.betStartDate.getTime() && now <= season.betEndDate.getTime();
    }

    /**
     * Lifecycle phase of the season for a given year (see {@link SeasonPhase}).
     * `season-open` covers everything between the end of betting and the close
     * date (the small gap before openDate included).
     */
    async getSeasonPhase(year: number): Promise<SeasonPhase> {
        const season = await this.findByYear(year);
        if (!season) return 'none';
        const now = Date.now();
        if (now < season.betStartDate.getTime()) return 'before';
        if (now <= season.betEndDate.getTime()) return 'betting';
        if (now <= season.closeDate.getTime()) return 'season-open';
        return 'closed';
    }

    /**
     * Whether other members' bets may be revealed for a year: true once the
     * season has opened (now ≥ openDate). No season → true (V1 compat). The
     * per-circle `betsVisible` flag is an additional gate applied by callers.
     */
    async isRevealed(year: number): Promise<boolean> {
        const season = await this.findByYear(year);
        if (!season) return true;
        return Date.now() >= season.openDate.getTime();
    }

    async create(dto: CreateSeasonDto) {
        await this.assertValid(dto);
        try {
            return await this.prisma.season.create({ data: dto });
        } catch (e) {
            throw this.mapYearConflict(e, dto.year);
        }
    }

    async update(id: string, dto: UpdateSeasonDto) {
        const existing = await this.prisma.season.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Saison introuvable.');
        // Merge only the dates the caller actually sent — the DTO carries the
        // untouched fields as `undefined`, which would otherwise blank the window.
        await this.assertValid(
            {
                openDate: dto.openDate ?? existing.openDate,
                betStartDate: dto.betStartDate ?? existing.betStartDate,
                betEndDate: dto.betEndDate ?? existing.betEndDate,
                closeDate: dto.closeDate ?? existing.closeDate,
            },
            id,
        );
        try {
            return await this.prisma.season.update({ where: { id }, data: dto });
        } catch (e) {
            throw this.mapYearConflict(e, dto.year ?? existing.year);
        }
    }

    /** Turns the `year` unique-constraint violation into a clean 409. */
    private mapYearConflict(error: unknown, year: number): unknown {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return new ConflictException(`Une saison existe déjà pour l'année ${year}.`);
        }
        return error;
    }

    remove(id: string) {
        return this.prisma.season.delete({ where: { id } });
    }

    /**
     * Validates the two windows independently — betting happens *before* the
     * season opens, so there is no cross-window ordering: only
     * `betStart ≤ betEnd` and `open ≤ close`. Then ensures the
     * [openDate, closeDate] window does not overlap another season. The unique
     * constraint on `year` already covers duplicate years at the DB level.
     */
    private async assertValid(window: SeasonWindow, excludeId?: string): Promise<void> {
        const openDate = new Date(window.openDate);
        const betStartDate = new Date(window.betStartDate);
        const betEndDate = new Date(window.betEndDate);
        const closeDate = new Date(window.closeDate);
        if (betStartDate.getTime() > betEndDate.getTime()) {
            throw new BadRequestException('Le début des paris doit précéder la fin des paris.');
        }
        if (openDate.getTime() > closeDate.getTime()) {
            throw new BadRequestException("L'ouverture de la saison doit précéder sa clôture.");
        }

        const overlap = await this.prisma.season.findFirst({
            where: {
                id: excludeId ? { not: excludeId } : undefined,
                // Two windows overlap when each starts before the other ends.
                openDate: { lt: closeDate },
                closeDate: { gt: openDate },
            },
            select: { id: true, year: true },
        });
        if (overlap) {
            throw new ConflictException(`La période chevauche celle de la saison ${overlap.year}.`);
        }
    }
}
