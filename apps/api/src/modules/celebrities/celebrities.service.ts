import { ageInYears, calculPointByCelebrity, deathYear } from '@necroloto/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SeasonsService } from '../seasons/seasons.service';
import { StorageService } from '../storage/storage.service';
import { WikidataService, type WikidataSummary } from '../wikidata/wikidata.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';

/** A recent celebrity death with scoring stats, for the dashboard feed. */
export interface DeathFeedEntry {
    celebrityId: string;
    celebrityName: string;
    age: number;
    death: string;
    scorers: number;
    points: number;
}

@Injectable()
export class CelebritiesService {
    constructor(
        private prisma: PrismaService,
        private wikidata: WikidataService,
        private storage: StorageService,
        private seasons: SeasonsService,
    ) {}

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

    /**
     * Paginated catalogue for the admin UI: name search (insensitive), status
     * filter (alive/deceased) and alphabetical order. Returns the page items plus
     * the total count matching the filter, so the front can drive infinite scroll.
     */
    async findPage(params: {
        search?: string;
        status?: 'all' | 'alive' | 'deceased';
        take: number;
        skip: number;
    }): Promise<{ items: Awaited<ReturnType<CelebritiesService['findAll']>>; total: number }> {
        const { search, status = 'all', take, skip } = params;
        const where: Prisma.CelebrityWhereInput = {
            ...(search && {
                name: { contains: search, mode: 'insensitive' },
            }),
            ...(status === 'alive' && { death: null }),
            ...(status === 'deceased' && { death: { not: null } }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.celebrity.findMany({
                where,
                orderBy: { name: 'asc' },
                take,
                skip,
                include: { CelebritiesOnBet: true },
            }),
            this.prisma.celebrity.count({ where }),
        ]);

        return { items, total };
    }

    /**
     * Recent celebrity deaths for a given year, with how many bets scored and the
     * total points awarded. Powers the dashboard "Décès récents" feed.
     */
    async deathFeed(year: number, limit: number): Promise<DeathFeedEntry[]> {
        const start = new Date(Date.UTC(year, 0, 1));
        const end = new Date(Date.UTC(year + 1, 0, 1));

        const celebrities = await this.prisma.celebrity.findMany({
            where: { death: { gte: start, lt: end } },
            orderBy: { death: 'desc' },
            take: limit,
            include: { CelebritiesOnBet: true },
        });

        return celebrities.map((celebrity) => {
            const scoring = celebrity.CelebritiesOnBet.filter((bet) => bet.points > 0);
            return {
                celebrityId: celebrity.id,
                celebrityName: celebrity.name,
                age:
                    celebrity.birth && celebrity.death
                        ? ageInYears(celebrity.birth, celebrity.death)
                        : 0,
                // death is non-null here (filtered above).
                death: (celebrity.death as Date).toISOString(),
                scorers: scoring.length,
                points: scoring.reduce((acc, bet) => acc + bet.points, 0),
            };
        });
    }

    /**
     * Celebrity detail with the list of bets that placed it. The bettors are
     * filtered server-side to what `viewerClerkId` may see: their own bets
     * always, plus others' bets only once the season is revealed (now ≥
     * openDate) AND the circle has `betsVisible`, AND the viewer is a member of
     * that circle. Before reveal the picks stay secret.
     */
    async findOne(id: string, viewerClerkId?: string) {
        const celebrity = await this.prisma.celebrity.findUnique({
            where: { id },
            include: {
                CelebritiesOnBet: {
                    include: {
                        bet: {
                            include: { user: true, Circle: true },
                        },
                    },
                },
            },
        });
        if (!celebrity) return celebrity;

        const viewer = viewerClerkId
            ? await this.prisma.user.findFirst({
                  where: { clerkId: viewerClerkId },
                  select: { id: true },
              })
            : null;
        const viewerId = viewer?.id;
        const myCircleIds = new Set(
            viewerId
                ? (
                      await this.prisma.membership.findMany({
                          where: { userId: viewerId },
                          select: { circleId: true },
                      })
                  ).map((m) => m.circleId)
                : [],
        );

        // Reveal state is per season year — resolve each distinct year once.
        const years = [...new Set(celebrity.CelebritiesOnBet.map((e) => e.bet.year))];
        const revealedByYear = new Map(
            await Promise.all(
                years.map(async (y) => [y, await this.seasons.isRevealed(y)] as const),
            ),
        );

        celebrity.CelebritiesOnBet = celebrity.CelebritiesOnBet.filter((e) => {
            if (e.bet.userId === viewerId) return true;
            return (
                !!e.bet.circleId &&
                myCircleIds.has(e.bet.circleId) &&
                !!e.bet.Circle?.betsVisible &&
                !!revealedByYear.get(e.bet.year)
            );
        });
        return celebrity;
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

    /** Deletes several celebrities at once. Returns how many rows were removed. */
    async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
        const { count } = await this.prisma.celebrity.deleteMany({
            where: { id: { in: ids } },
        });
        return { deleted: count };
    }

    /** Updates only the photo URL (no scoring recalculation needed). */
    async setPhoto(id: string, photo: string) {
        return this.prisma.celebrity.update({
            where: { id },
            data: { photo },
        });
    }

    /** Wikidata candidates for a name, for admin disambiguation. */
    searchWikidata(name: string): Promise<WikidataSummary[]> {
        return this.wikidata.searchByName(name);
    }

    /**
     * Enriches a celebrity from Wikidata: fills birth/death/photo/role and stores
     * the linked `wikidataId`. The entity is taken from `wikidataId` (explicit choice),
     * else the celebrity's existing link, else the best match for its name.
     * Wikidata values win over existing ones; missing values are left untouched.
     * Re-runnable; recomputes points afterwards (a death may now be known).
     */
    async enrich(id: string, wikidataId?: string) {
        const celebrity = await this.prisma.celebrity.findUnique({ where: { id } });
        if (!celebrity) throw new NotFoundException('Celebrity not found');

        const qid = wikidataId ?? celebrity.wikidataId ?? undefined;
        const summary = qid
            ? await this.wikidata.getEntity(qid)
            : (await this.wikidata.searchByName(celebrity.name)).find((c) => c.isHuman);
        if (!summary) {
            throw new NotFoundException('No Wikidata match found');
        }

        const photo = summary.photoFilename
            ? await this.importPhoto(id, summary.photoFilename)
            : celebrity.photo;

        // Map the first Wikidata occupation (P106) to the free-text role.
        const role = summary.occupationIds[0]
            ? ((await this.wikidata.resolveLabel(summary.occupationIds[0])) ?? celebrity.role)
            : celebrity.role;

        const updated = await this.prisma.celebrity.update({
            where: { id },
            data: {
                wikidataId: summary.wikidataId,
                birth: summary.birth ?? celebrity.birth,
                death: summary.death ?? celebrity.death,
                photo,
                role,
            },
        });
        await this.recalculatePoints(id);
        return updated;
    }

    /**
     * Downloads a Wikimedia Commons image and re-hosts it in our bucket. Falls
     * back to the Commons URL if storage is disabled or the download fails.
     */
    private async importPhoto(celebrityId: string, filename: string): Promise<string> {
        const commonsUrl = this.wikidata.photoUrl(filename);
        if (!this.storage.enabled) return commonsUrl;
        try {
            const res = await fetch(commonsUrl, { redirect: 'follow' });
            if (!res.ok) return commonsUrl;
            const buffer = Buffer.from(await res.arrayBuffer());
            const mimetype = res.headers.get('content-type') ?? 'image/jpeg';
            return await this.storage.uploadCelebrityPhoto(celebrityId, {
                buffer,
                mimetype,
            });
        } catch {
            return commonsUrl;
        }
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
