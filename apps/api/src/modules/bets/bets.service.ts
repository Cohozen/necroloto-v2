import { deathYear } from '@necroloto/shared';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CelebritiesService } from '../celebrities/celebrities.service';
import { SeasonsService } from '../seasons/seasons.service';
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
        private seasons: SeasonsService,
    ) {}

    /**
     * Gates a bet create/edit against the season phase and the circle flags.
     * Betting happens before the season opens, so:
     *  - `betting`      → always allowed (the window IS the betting time);
     *  - `season-open`  → allowed only via the circle "rallonge" flag
     *                     (`allowNewBet` for a new bet, `allowEdit` for an edit);
     *  - `before`/`closed` → forbidden;
     *  - `none` (no season) → V1 compat: the circle flag is the only gate.
     * A bet without a circle has no flags → the phase alone decides.
     */
    private async assertCanBet(
        year: number,
        mode: 'create' | 'edit',
        flag: boolean | undefined,
    ): Promise<void> {
        const phase = await this.seasons.getSeasonPhase(year);
        const allowedByFlag = flag ?? true;
        const newBetMsg = 'Les nouveaux paris sont fermés pour ce cercle.';
        const editMsg = "La liste n'est pas modifiable pour ce cercle.";
        const windowMsg = 'Les paris ne sont pas ouverts pour cette saison.';

        switch (phase) {
            case 'betting':
                return;
            case 'none':
            case 'season-open':
                if (!allowedByFlag) {
                    throw new ForbiddenException(mode === 'create' ? newBetMsg : editMsg);
                }
                return;
            default: // 'before' | 'closed'
                throw new ForbiddenException(windowMsg);
        }
    }

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

    /**
     * Refuses a bet that lists an already-deceased celebrity. We trust the stored
     * `Celebrity.death` (no Wikidata call) — a Wikidata proposal is enriched inline,
     * so a freshly added dead pick already carries its death date here. A death in
     * the bet's own year is allowed (it's the winning pick); only deaths from another
     * year (i.e. already dead before the season) are blocked.
     */
    private async assertNoDeceased(celebrityIds: string[], year: number): Promise<void> {
        if (celebrityIds.length === 0) return;
        const deceased = await this.prisma.celebrity.findMany({
            where: { id: { in: celebrityIds }, death: { not: null } },
            select: { name: true, death: true },
        });
        const alreadyDead = deceased.filter((c) => c.death && deathYear(c.death) !== year);
        if (alreadyDead.length > 0) {
            const names = alreadyDead.map((c) => c.name).join(', ');
            throw new BadRequestException(
                `Ces célébrités sont déjà décédées et ne peuvent pas être pariées : ${names}.`,
            );
        }
    }

    async create(createBetDto: CreateBetDto) {
        const { celebrityIds = [], ...betData } = createBetDto;

        // Gate against the season phase + the circle's "new bets" flag.
        const circle = betData.circleId
            ? await this.prisma.circle.findUnique({ where: { id: betData.circleId } })
            : null;
        await this.assertCanBet(betData.year, 'create', circle?.allowNewBet);

        const ids = await this.resolveCelebrityIds(celebrityIds);
        await this.assertNoDeceased(ids, betData.year);

        let bet: { id: string };
        try {
            bet = await this.prisma.bet.create({
                data: {
                    ...betData,
                    CelebritiesOnBet: {
                        create: ids.map((celebrityId) => ({ celebrityId })),
                    },
                },
                include: betInclude,
            });
        } catch (error) {
            // One bet per (userId, circleId, year): a duplicate is a conflict, not a 500.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Un pari existe déjà pour cette saison.');
            }
            throw error;
        }

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
        // Gate against the season phase + the circle's "editable list" flag.
        const bet = await this.prisma.bet.findUnique({
            where: { id: betId },
            include: { Circle: true },
        });
        if (bet) await this.assertCanBet(bet.year, 'edit', bet.Circle?.allowEdit);

        const ids = await this.resolveCelebrityIds(keys);
        if (bet) await this.assertNoDeceased(ids, bet.year);

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
    async rankByYearAndCircle(
        circleId: string,
        year: number,
        sort: SortByRank = 'points',
        viewerClerkId?: string,
    ) {
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

        // Keep rosters secret until the season is revealed (now ≥ openDate) and
        // the circle has betsVisible — except the viewer's own bet. Totals/ranks
        // are already computed above, so blanking the picks doesn't affect them.
        const viewer = viewerClerkId
            ? await this.prisma.user.findUnique({
                  where: { clerkId: viewerClerkId },
                  select: { id: true },
              })
            : null;
        const revealed = (await this.seasons.isRevealed(year)) && sorted[0]?.Circle?.betsVisible;

        let currentRank = 1;
        return sorted.map((bet, index) => {
            if (index > 0 && value(bet) !== value(sorted[index - 1])) currentRank += 1;
            const visible = bet.userId === viewer?.id || revealed;
            return {
                ...bet,
                rank: currentRank,
                CelebritiesOnBet: visible ? bet.CelebritiesOnBet : [],
            };
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

    /**
     * Bets of a circle/year for the "Paris" tab, viewer-aware: the viewer must
     * be a member; they always see their own bet, but others' bets only once the
     * season is revealed (now ≥ openDate) AND the circle has `betsVisible`.
     * Before reveal the others' picks stay secret.
     */
    async listVisibleByCircle(circleId: string, year: number, viewerClerkId?: string) {
        const viewer = viewerClerkId
            ? await this.prisma.user.findUnique({
                  where: { clerkId: viewerClerkId },
                  select: { id: true },
              })
            : null;
        const viewerId = viewer?.id;
        if (!viewerId) return [];

        const membership = await this.prisma.membership.findFirst({
            where: { circleId, userId: viewerId },
            select: { id: true },
        });
        if (!membership) return [];

        const circle = await this.prisma.circle.findUnique({
            where: { id: circleId },
            select: { betsVisible: true },
        });
        const revealed = (await this.seasons.isRevealed(year)) && !!circle?.betsVisible;

        const bets = await this.prisma.bet.findMany({
            where: { year, circleId },
            include: betInclude,
        });
        return revealed ? bets : bets.filter((b) => b.userId === viewerId);
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
