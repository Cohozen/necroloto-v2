import { calculPointByCelebrity, deathYear } from '@necroloto/shared';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';

@Injectable()
export class CelebritiesService {
    constructor(private prisma: PrismaService) {}

    async create(createCelebrityDto: CreateCelebrityDto) {
        const celebrity = await this.prisma.celebrity.create({
            data: createCelebrityDto,
        });
        await this.recalculatePoints(celebrity.id);
        return celebrity;
    }

    async findAll() {
        return this.prisma.celebrity.findMany({
            include: {
                CelebritiesOnBet: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.celebrity.findUnique({
            where: { id },
            include: {
                CelebritiesOnBet: true,
            },
        });
    }

    async update(id: string, updateCelebrityDto: UpdateCelebrityDto) {
        const celebrity = await this.prisma.celebrity.update({
            where: { id },
            data: updateCelebrityDto,
        });
        // A change to birth/death can change every dependent bet's points.
        await this.recalculatePoints(id);
        return celebrity;
    }

    /**
     * Recomputes the points of every bet that lists this celebrity, from the
     * celebrity's current birth/death. Single source of truth for scoring,
     * called whenever a celebrity changes (admin edit or Wikidata automation).
     *
     * Rules (ported from the prod app):
     *  - A death awards `calculPointByCelebrity(birth, death)` points, but only to
     *    bets whose `year` equals the death year. Bets for any other year score 0.
     *  - Missing birth or death -> 0 points everywhere.
     *
     * Idempotent (safe to re-run) and pgBouncer-safe (no interactive transaction).
     */
    async recalculatePoints(celebrityId: string): Promise<void> {
        const celebrity = await this.prisma.celebrity.findUnique({
            where: { id: celebrityId },
        });
        if (!celebrity) return;

        if (celebrity.birth && celebrity.death) {
            const points = calculPointByCelebrity(celebrity.birth, celebrity.death);
            const year = deathYear(celebrity.death);
            await this.prisma.$transaction([
                this.prisma.celebritiesOnBet.updateMany({
                    where: { celebrityId, bet: { year } },
                    data: { points },
                }),
                this.prisma.celebritiesOnBet.updateMany({
                    where: { celebrityId, bet: { year: { not: year } } },
                    data: { points: 0 },
                }),
            ]);
        } else {
            await this.prisma.celebritiesOnBet.updateMany({
                where: { celebrityId },
                data: { points: 0 },
            });
        }
    }

    async remove(id: string) {
        return this.prisma.celebrity.delete({
            where: { id },
        });
    }

    /** Updates only the photo URL (no scoring recalculation needed). */
    async setPhoto(id: string, photo: string) {
        return this.prisma.celebrity.update({
            where: { id },
            data: { photo },
        });
    }

    async search(searchCelebrityDto: SearchCelebrityDto) {
        const { name, isAlive, birthYear } = searchCelebrityDto;

        return this.prisma.celebrity.findMany({
            where: {
                ...(name && {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                }),
                ...(isAlive !== undefined && {
                    death: isAlive ? null : { not: null },
                }),
                ...(birthYear && {
                    birth: {
                        gte: new Date(`${birthYear}-01-01`),
                        lt: new Date(`${birthYear + 1}-01-01`),
                    },
                }),
            },
            include: {
                CelebritiesOnBet: true,
            },
        });
    }

    async merge(sourceId: string, targetId: string) {
        // Update all CelebritiesOnBet from source to target
        await this.prisma.celebritiesOnBet.updateMany({
            where: { celebrityId: sourceId },
            data: { celebrityId: targetId },
        });

        // Delete the source celebrity
        return this.prisma.celebrity.delete({
            where: { id: sourceId },
        });
    }
}
