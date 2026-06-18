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
     * Active season: the one whose [openDate, closeDate] window contains now,
     * else the most recent one (by closeDate). May be null when no season exists.
     */
    async getActive() {
        const now = new Date();
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
     * Validates date ordering (open ≤ betStart ≤ betEnd ≤ close) and ensures the
     * [openDate, closeDate] window does not overlap another season. The unique
     * constraint on `year` already covers duplicate years at the DB level.
     */
    private async assertValid(window: SeasonWindow, excludeId?: string): Promise<void> {
        const openDate = new Date(window.openDate);
        const betStartDate = new Date(window.betStartDate);
        const betEndDate = new Date(window.betEndDate);
        const closeDate = new Date(window.closeDate);
        if (
            !(
                openDate.getTime() <= betStartDate.getTime() &&
                betStartDate.getTime() <= betEndDate.getTime() &&
                betEndDate.getTime() <= closeDate.getTime()
            )
        ) {
            throw new BadRequestException(
                'Les dates doivent être ordonnées : ouverture ≤ début des paris ≤ fin des paris ≤ clôture.',
            );
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
