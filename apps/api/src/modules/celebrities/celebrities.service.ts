import { ageInYears, calculPointByCelebrity, deathYear } from '@necroloto/shared';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    type CelebrityDiedEvent,
    NotificationEvents,
    type ProposalEvent,
} from '../notifications/events';
import { SeasonsService } from '../seasons/seasons.service';
import { StorageService } from '../storage/storage.service';
import { WikidataService, type WikidataSummary } from '../wikidata/wikidata.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { ProposeCelebrityDto } from './dto/propose-celebrity.dto';
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
        private events: EventEmitter2,
    ) {}

    async create(createCelebrityDto: CreateCelebrityDto) {
        const celebrity = await this.prisma.celebrity.create({
            data: createCelebrityDto,
        });
        await this.recalculatePoints(celebrity.id);
        return celebrity;
    }

    /** Maps a Clerk id to its DB `User.id`, or undefined. */
    private async resolveViewerId(clerkId?: string): Promise<string | undefined> {
        if (!clerkId) return undefined;
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
            select: { id: true },
        });
        return user?.id;
    }

    /**
     * A player proposes a missing celebrity from the bet draft. The entry is
     * created PENDING and stays visible only to its proposer until an admin
     * approves it. Dedup: a Wikidata pick reuses any existing row for that
     * unique entity (and is refused if that entity was already REJECTED); a
     * manual entry reuses an existing row with the same name (case-insensitive).
     * When a `wikidataId` is given the row is enriched inline (dates/photo/role).
     */
    async propose(dto: ProposeCelebrityDto, viewerClerkId?: string) {
        const viewerId = await this.resolveViewerId(viewerClerkId);

        if (dto.wikidataId) {
            const existing = await this.prisma.celebrity.findUnique({
                where: { wikidataId: dto.wikidataId },
            });
            if (existing) {
                if (existing.status === 'REJECTED') {
                    throw new ForbiddenException('Cette célébrité a déjà été refusée.');
                }
                return existing;
            }
        } else {
            const existing = await this.prisma.celebrity.findFirst({
                where: { name: { equals: dto.name, mode: 'insensitive' } },
            });
            // Reuse a non-rejected same-name row; ignore rejected ones so a fresh
            // proposal is still possible after an unrelated rejection.
            if (existing && existing.status !== 'REJECTED') return existing;
        }

        let celebrity: { id: string };
        try {
            celebrity = await this.prisma.celebrity.create({
                data: {
                    name: dto.name,
                    birth: dto.birth,
                    death: dto.death,
                    photo: dto.photo,
                    role: dto.role,
                    category: dto.category,
                    wikidataId: dto.wikidataId,
                    status: 'PENDING',
                    proposedBy: viewerId,
                    proposedAt: new Date(),
                },
            });
        } catch (error) {
            // Race: two simultaneous proposals of the same Wikidata entity.
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                dto.wikidataId
            ) {
                const existing = await this.prisma.celebrity.findUnique({
                    where: { wikidataId: dto.wikidataId },
                });
                if (existing) return existing;
            }
            throw error;
        }

        // A genuinely new PENDING proposal — let the admins know it awaits validation.
        this.events.emit(NotificationEvents.ProposalPending, {
            celebrityId: celebrity.id,
            celebrityName: dto.name,
            proposerId: viewerId ?? null,
        } satisfies ProposalEvent);

        if (dto.wikidataId) {
            // Fills birth/death/photo/role from Wikidata and recalculates points.
            return this.enrich(celebrity.id, dto.wikidataId);
        }
        await this.recalculatePoints(celebrity.id);
        return this.prisma.celebrity.findUnique({ where: { id: celebrity.id } });
    }

    /** Admin: validate a proposed celebrity. Optionally enrich from Wikidata first. */
    async approve(id: string, wikidataId?: string) {
        const celebrity = await this.prisma.celebrity.findUnique({ where: { id } });
        if (!celebrity) throw new NotFoundException('Celebrity not found');

        const updated = await this.prisma.celebrity.update({
            where: { id },
            data: { status: 'APPROVED' },
        });
        // Notify the proposer their pending pick was validated.
        if (celebrity.status === 'PENDING' && celebrity.proposedBy) {
            this.events.emit(NotificationEvents.ProposalApproved, {
                celebrityId: id,
                celebrityName: celebrity.name,
                proposerId: celebrity.proposedBy,
            } satisfies ProposalEvent);
        }
        if (wikidataId) {
            // enrich already recalculates points.
            return this.enrich(id, wikidataId);
        }
        await this.recalculatePoints(id);
        return updated;
    }

    /**
     * Admin: reject a proposed celebrity. The row is kept REJECTED (so the same
     * Wikidata entity can't be re-proposed in a loop) but pulled out of every
     * bet that listed it, so no bet keeps an unvalidated pick.
     */
    async reject(id: string) {
        const celebrity = await this.prisma.celebrity.findUnique({ where: { id } });
        if (!celebrity) throw new NotFoundException('Celebrity not found');

        await this.prisma.$transaction([
            this.prisma.celebritiesOnBet.deleteMany({ where: { celebrityId: id } }),
            this.prisma.celebrity.update({
                where: { id },
                data: { status: 'REJECTED' },
            }),
        ]);
        // Notify the proposer their pending pick was turned down.
        if (celebrity.status === 'PENDING' && celebrity.proposedBy) {
            this.events.emit(NotificationEvents.ProposalRejected, {
                celebrityId: id,
                celebrityName: celebrity.name,
                proposerId: celebrity.proposedBy,
            } satisfies ProposalEvent);
        }
        return this.prisma.celebrity.findUnique({ where: { id } });
    }

    /**
     * Catalogue for the bet draft. Approved celebrities are visible to everyone;
     * a viewer additionally sees their own still-pending proposals (so they can
     * keep them in their bet). Rejected entries never surface here.
     */
    async findAll(viewerClerkId?: string) {
        const viewerId = await this.resolveViewerId(viewerClerkId);
        return this.prisma.celebrity.findMany({
            where: {
                OR: [
                    { status: 'APPROVED' },
                    ...(viewerId ? [{ status: 'PENDING' as const, proposedBy: viewerId }] : []),
                ],
            },
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
        status?: 'all' | 'alive' | 'deceased' | 'pending';
        wikidata?: 'linked' | 'unlinked';
        take: number;
        skip: number;
    }): Promise<{ items: Awaited<ReturnType<CelebritiesService['findAll']>>; total: number }> {
        const { search, status = 'all', wikidata, take, skip } = params;
        const where: Prisma.CelebrityWhereInput = {
            ...(search && {
                name: { contains: search, mode: 'insensitive' },
            }),
            ...(status === 'alive' && { death: null }),
            ...(status === 'deceased' && { death: { not: null } }),
            ...(status === 'pending' && { status: 'PENDING' }),
            ...(wikidata === 'unlinked' && { wikidataId: null }),
            ...(wikidata === 'linked' && { wikidataId: { not: null } }),
        };

        // The pending review queue reads newest-first; the rest stay alphabetical.
        const orderBy: Prisma.CelebrityOrderByWithRelationInput =
            status === 'pending' ? { proposedAt: 'desc' } : { name: 'asc' };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.celebrity.findMany({
                where,
                orderBy,
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
            // Only validated deaths surface in the public feed — a pending
            // proposal that dies stays private to its proposer until approved.
            where: { status: 'APPROVED', death: { gte: start, lt: end } },
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
    async findOne(id: string, viewerClerkId?: string, isAdmin = false) {
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

        const viewerId = await this.resolveViewerId(viewerClerkId);

        // A pending proposal is private: only its proposer (or an admin) may open
        // the fiche. Others get a 404-like null.
        if (celebrity.status === 'PENDING' && !isAdmin && celebrity.proposedBy !== viewerId) {
            return null;
        }
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
        // Capture the prior death so we can notify bettors when an admin records
        // a death by hand (the automated path notifies from DeathDetectionService).
        const before = await this.prisma.celebrity.findUnique({
            where: { id },
            select: { death: true },
        });
        const celebrity = await this.prisma.celebrity.update({
            where: { id },
            data: updateCelebrityDto,
        });
        // A change to birth/death can change every dependent bet's points.
        await this.recalculatePoints(id);

        if (!before?.death && celebrity.death) {
            this.events.emit(NotificationEvents.CelebrityDied, {
                celebrityId: id,
                deathYear: celebrity.death.getUTCFullYear(),
            } satisfies CelebrityDiedEvent);
        }
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

    async search(searchCelebrityDto: SearchCelebrityDto, viewerClerkId?: string) {
        const { name, isAlive, birthYear } = searchCelebrityDto;
        const viewerId = await this.resolveViewerId(viewerClerkId);

        return this.prisma.celebrity.findMany({
            where: {
                // Same visibility as the catalogue: approved to all, own pending to self.
                AND: [
                    {
                        OR: [
                            { status: 'APPROVED' },
                            ...(viewerId
                                ? [{ status: 'PENDING' as const, proposedBy: viewerId }]
                                : []),
                        ],
                    },
                ],
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

    /**
     * Merges a duplicate (source) into a target celebrity: every bet on the
     * source is redirected to the target, then the source is deleted and the
     * target's points recalculated. Bets that listed BOTH source and target
     * would collide on the `(betId, celebrityId)` PK, so those source rows are
     * dropped first (the target row already covers the bet).
     */
    async merge(sourceId: string, targetId: string) {
        if (sourceId === targetId) {
            throw new ForbiddenException('Source et cible identiques.');
        }

        // Bets that already point at the target: their source row would collide.
        const targetBetIds = (
            await this.prisma.celebritiesOnBet.findMany({
                where: { celebrityId: targetId },
                select: { betId: true },
            })
        ).map((r) => r.betId);

        await this.prisma.$transaction([
            // Drop colliding source rows (the bet keeps its target row).
            this.prisma.celebritiesOnBet.deleteMany({
                where: { celebrityId: sourceId, betId: { in: targetBetIds } },
            }),
            // Redirect the remaining source bets onto the target.
            this.prisma.celebritiesOnBet.updateMany({
                where: { celebrityId: sourceId },
                data: { celebrityId: targetId },
            }),
            this.prisma.celebrity.delete({ where: { id: sourceId } }),
        ]);

        await this.recalculatePoints(targetId);
        return this.prisma.celebrity.findUnique({ where: { id: targetId } });
    }
}
