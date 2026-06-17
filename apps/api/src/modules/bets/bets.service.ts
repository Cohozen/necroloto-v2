import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CelebritiesService } from '../celebrities/celebrities.service';
import { AddCelebrityToBetDto } from './dto/add-celebrity-to-bet.dto';
import { CreateBetDto } from './dto/create-bet.dto';
import { SearchBetDto } from './dto/search-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { UpdatePointsDto } from './dto/update-points.dto';

export type SortByRank = 'points' | 'death';

const betInclude = {
    user: true,
    Circle: true,
    CelebritiesOnBet: { include: { celebrity: true } },
} as const;

@Injectable()
export class BetsService {
    constructor(
        private prisma: PrismaService,
        private celebrities: CelebritiesService,
    ) {}

    /**
     * Resolves a list of celebrity "keys" to celebrity ids. Each key is matched
     * first by id, then by name (case-insensitive); if nothing matches a new
     * celebrity is created on the fly. Ported from the prod app so the bet form
     * can accept free-typed names. Returns de-duplicated ids.
     */
    private async resolveCelebrityIds(keys: string[]): Promise<string[]> {
        const ids: string[] = [];
        for (const raw of keys) {
            const key = raw.trim();
            if (!key) continue;

            let celebrity = await this.prisma.celebrity.findUnique({
                where: { id: key },
            });
            if (!celebrity) {
                celebrity = await this.prisma.celebrity.findFirst({
                    where: { name: { equals: key, mode: 'insensitive' } },
                });
            }
            if (!celebrity) {
                celebrity = await this.prisma.celebrity.create({ data: { name: key } });
            }
            ids.push(celebrity.id);
        }
        return [...new Set(ids)];
    }

    async create(createBetDto: CreateBetDto) {
        const { celebrityIds = [], ...betData } = createBetDto;

        // Respect the circle's "new bets" lock (allowNewBet).
        if (betData.circleId) {
            const circle = await this.prisma.circle.findUnique({
                where: { id: betData.circleId },
            });
            if (circle && !circle.allowNewBet) {
                throw new ForbiddenException('Les nouveaux paris sont fermés pour ce cercle.');
            }
        }

        const ids = await this.resolveCelebrityIds(celebrityIds);

        const bet = await this.prisma.bet.create({
            data: {
                ...betData,
                CelebritiesOnBet: {
                    create: ids.map((celebrityId) => ({ celebrityId })),
                },
            },
            include: betInclude,
        });

        // A freshly listed celebrity may already be deceased -> score it now.
        await this.scoreCelebrities(ids);
        return this.findOne(bet.id);
    }

    /**
     * Replaces the full celebrity list of a bet (ported from the prod app's
     * updateBetWithCelebrities). pgBouncer-safe: uses a batched transaction
     * instead of an interactive one.
     */
    async replaceCelebrities(betId: string, keys: string[]) {
        // Respect the circle's "editable list" lock (allowEdit).
        const bet = await this.prisma.bet.findUnique({
            where: { id: betId },
            include: { Circle: true },
        });
        if (bet?.Circle && !bet.Circle.allowEdit) {
            throw new ForbiddenException("La liste n'est pas modifiable pour ce cercle.");
        }

        const ids = await this.resolveCelebrityIds(keys);

        await this.prisma.$transaction([
            this.prisma.celebritiesOnBet.deleteMany({ where: { betId } }),
            ...ids.map((celebrityId) =>
                this.prisma.celebritiesOnBet.create({ data: { betId, celebrityId } }),
            ),
            this.prisma.bet.update({
                where: { id: betId },
                data: { updatedAt: new Date() },
            }),
        ]);

        await this.scoreCelebrities(ids);
        return this.findOne(betId);
    }

    /** Recomputes points for each affected celebrity (delegates to the scoring source of truth). */
    private async scoreCelebrities(celebrityIds: string[]): Promise<void> {
        for (const id of celebrityIds) {
            await this.celebrities.recalculatePoints(id);
        }
    }

    /**
     * Leaderboard for a circle and year. Ported from the prod app
     * (RankBetsByYearWithTotalPoints): dense ranking where tied bets share a rank.
     */
    async rankByYearAndCircle(circleId: string, year: number, sort: SortByRank = 'points') {
        const bets = await this.prisma.bet.findMany({
            where: { year, circleId },
            include: betInclude,
        });

        const totals = bets.map((b) => ({
            ...b,
            total: b.CelebritiesOnBet.reduce((acc, c) => acc + c.points, 0),
            deathCount: b.CelebritiesOnBet.filter((c) => !!c.celebrity.death).length,
        }));

        const value = (b: (typeof totals)[number]) => (sort === 'death' ? b.deathCount : b.total);

        const sorted = [...totals].sort((a, b) => value(b) - value(a));

        let currentRank = 1;
        return sorted.map((bet, index) => {
            if (index > 0 && value(bet) !== value(sorted[index - 1])) currentRank += 1;
            return { ...bet, rank: currentRank };
        });
    }

    /** Rank of a given user in a circle/year leaderboard (0 if they have no bet). */
    async positionOfUser(
        userId: string,
        circleId: string,
        year: number,
        sort: SortByRank = 'points',
    ): Promise<number> {
        const ranked = await this.rankByYearAndCircle(circleId, year, sort);
        return ranked.find((b) => b.userId === userId)?.rank ?? 0;
    }

    async findAll() {
        return this.prisma.bet.findMany({
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.bet.findUnique({
            where: { id },
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.bet.findMany({
            where: { userId },
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async findByCircle(circleId: string) {
        return this.prisma.bet.findMany({
            where: { circleId },
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async search(searchBetDto: SearchBetDto) {
        const { userId, circleId, year } = searchBetDto;

        return this.prisma.bet.findMany({
            where: {
                ...(userId && { userId }),
                ...(circleId && { circleId }),
                ...(year && { year }),
            },
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateBetDto: UpdateBetDto) {
        return this.prisma.bet.update({
            where: { id },
            data: updateBetDto,
            include: {
                user: true,
                Circle: true,
                CelebritiesOnBet: {
                    include: {
                        celebrity: true,
                    },
                },
            },
        });
    }

    async addCelebrityToBet(betId: string, dto: AddCelebrityToBetDto) {
        return this.prisma.celebritiesOnBet.create({
            data: {
                betId,
                celebrityId: dto.celebrityId,
            },
            include: {
                bet: true,
                celebrity: true,
            },
        });
    }

    async updateCelebrityPoints(betId: string, celebrityId: string, dto: UpdatePointsDto) {
        return this.prisma.celebritiesOnBet.update({
            where: {
                betId_celebrityId: {
                    betId,
                    celebrityId,
                },
            },
            data: {
                points: dto.points,
            },
            include: {
                bet: true,
                celebrity: true,
            },
        });
    }

    async removeCelebrityFromBet(betId: string, celebrityId: string) {
        return this.prisma.celebritiesOnBet.delete({
            where: {
                betId_celebrityId: {
                    betId,
                    celebrityId,
                },
            },
        });
    }

    async remove(id: string) {
        return this.prisma.bet.delete({
            where: { id },
        });
    }
}
