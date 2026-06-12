import { calculPointByCelebrity, deathYear } from '@necroloto/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { WikidataService, type WikidataSummary } from '../wikidata/wikidata.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';

@Injectable()
export class CelebritiesService {
    constructor(
        private prisma: PrismaService,
        private wikidata: WikidataService,
        private storage: StorageService,
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

    /** Wikidata candidates for a name, for admin disambiguation. */
    searchWikidata(name: string): Promise<WikidataSummary[]> {
        return this.wikidata.searchByName(name);
    }

    /**
     * Enriches a celebrity from Wikidata: fills birth/death/photo and stores the
     * linked `wikidataId`. The entity is taken from `wikidataId` (explicit choice),
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

        const updated = await this.prisma.celebrity.update({
            where: { id },
            data: {
                wikidataId: summary.wikidataId,
                birth: summary.birth ?? celebrity.birth,
                death: summary.death ?? celebrity.death,
                photo,
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
