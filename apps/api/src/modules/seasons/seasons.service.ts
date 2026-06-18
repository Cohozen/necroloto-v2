import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

/** Resolved date window of a season, used for validation/overlap checks. */
interface SeasonWindow {
    openDate: Date;
    betStartDate: Date;
    betEndDate: Date;
    closeDate: Date;
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

    async create(dto: CreateSeasonDto) {
        await this.assertValid(dto);
        return this.prisma.season.create({ data: dto });
    }

    async update(id: string, dto: UpdateSeasonDto) {
        const existing = await this.prisma.season.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Saison introuvable.');
        await this.assertValid({ ...existing, ...dto }, id);
        return this.prisma.season.update({ where: { id }, data: dto });
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
        const { openDate, betStartDate, betEndDate, closeDate } = window;
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
            throw new ConflictException(
                `La période chevauche celle de la saison ${overlap.year}.`,
            );
        }
    }
}
