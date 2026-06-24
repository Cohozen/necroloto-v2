import { Injectable, Logger } from '@nestjs/common';

export interface WikidataSummary {
    /** Wikidata entity id, e.g. "Q42". */
    wikidataId: string;
    label: string;
    description?: string;
    /** UTC date (day precision; year-only dates fall back to Jan 1st). */
    birth?: Date;
    death?: Date;
    /** Wikimedia Commons file name of the main image (P18), if any. */
    photoFilename?: string;
    /** Q-ids of the entity's occupations (P106), in Wikidata order. */
    occupationIds: string[];
    /** Q-ids of the entity's countries of citizenship (P27), in Wikidata order. */
    citizenshipIds: string[];
    /** Q-id of the entity's sex/gender (P21), if any. */
    genderId?: string;
    /** True if the entity is an instance of human (P31 = Q5). */
    isHuman: boolean;
}

interface RawSnak {
    mainsnak?: {
        datavalue?: { value?: unknown };
    };
}
interface RawEntity {
    id: string;
    labels?: Record<string, { value: string }>;
    descriptions?: Record<string, { value: string }>;
    claims?: Record<string, RawSnak[]>;
}

/**
 * Read-only client for the Wikidata API (no API key needed). Used to enrich
 * celebrities (birth/death/photo) and to detect deaths. Wikidata asks for a
 * descriptive User-Agent — see https://meta.wikimedia.org/wiki/User-Agent_policy.
 */
@Injectable()
export class WikidataService {
    private readonly logger = new Logger('Wikidata');
    private readonly api = 'https://www.wikidata.org/w/api.php';
    private readonly userAgent = 'Necroloto/1.0 (https://github.com/Cohozen/necroloto-v2)';

    /** Searches entities by name and returns enriched summaries (humans first). */
    async searchByName(name: string, limit = 7): Promise<WikidataSummary[]> {
        const ids = await this.searchIds(name, limit);
        if (ids.length === 0) return [];
        const summaries = await this.getEntities(ids);
        // Keep Wikidata's relevance order but push non-humans to the end.
        return summaries.sort((a, b) => Number(b.isHuman) - Number(a.isHuman));
    }

    /** Fetches and parses entities for the given Q-ids (batched by 50). */
    async getEntities(ids: string[]): Promise<WikidataSummary[]> {
        const out: WikidataSummary[] = [];
        for (let i = 0; i < ids.length; i += 50) {
            const batch = ids.slice(i, i + 50);
            const url =
                `${this.api}?action=wbgetentities&format=json` +
                `&ids=${batch.join('|')}` +
                `&props=labels|descriptions|claims&languages=fr|en`;
            const json = await this.fetchJson(url);
            const entities = (json?.entities ?? {}) as Record<string, RawEntity>;
            for (const entity of Object.values(entities)) {
                out.push(this.parseEntity(entity));
            }
        }
        return out;
    }

    async getEntity(id: string): Promise<WikidataSummary | undefined> {
        const [entity] = await this.getEntities([id]);
        return entity;
    }

    /** Public URL of a Commons image, scaled to `width` px. */
    photoUrl(filename: string, width = 500): string {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
            filename,
        )}?width=${width}`;
    }

    private async searchIds(name: string, limit: number): Promise<string[]> {
        const url =
            `${this.api}?action=wbsearchentities&format=json&type=item` +
            `&language=fr&uselang=fr&limit=${limit}&search=${encodeURIComponent(name)}`;
        const json = await this.fetchJson(url);
        const results = (json?.search ?? []) as Array<{ id: string }>;
        return results.map((r) => r.id);
    }

    private parseEntity(entity: RawEntity): WikidataSummary {
        const claims = entity.claims ?? {};
        const isHuman = (claims.P31 ?? []).some(
            (c) => (c.mainsnak?.datavalue?.value as { id?: string } | undefined)?.id === 'Q5',
        );
        const photoFilename = claims.P18?.[0]?.mainsnak?.datavalue?.value as string | undefined;
        const occupationIds = this.parseEntityIds(claims.P106);
        const citizenshipIds = this.parseEntityIds(claims.P27);
        const genderId = this.parseEntityIds(claims.P21)[0];

        return {
            wikidataId: entity.id,
            label: entity.labels?.fr?.value ?? entity.labels?.en?.value ?? entity.id,
            description: entity.descriptions?.fr?.value ?? entity.descriptions?.en?.value,
            birth: this.parseTimeClaim(claims.P569),
            death: this.parseTimeClaim(claims.P570),
            photoFilename,
            occupationIds,
            citizenshipIds,
            genderId,
            isHuman,
        };
    }

    /** Extracts the entity Q-ids referenced by a claim (P106/P27/P21…), in order. */
    private parseEntityIds(claim?: RawSnak[]): string[] {
        return (claim ?? [])
            .map((c) => (c.mainsnak?.datavalue?.value as { id?: string } | undefined)?.id)
            .filter((id): id is string => Boolean(id));
    }

    /**
     * Resolves a single entity's label (FR, falling back to EN), capitalised.
     * Used to turn an occupation Q-id (P106) into a human-readable role.
     */
    async resolveLabel(qid: string): Promise<string | undefined> {
        const url =
            `${this.api}?action=wbgetentities&format=json` +
            `&ids=${encodeURIComponent(qid)}&props=labels&languages=fr|en`;
        const json = await this.fetchJson(url);
        const entity = (json?.entities ?? {})[qid] as RawEntity | undefined;
        const label = entity?.labels?.fr?.value ?? entity?.labels?.en?.value;
        return label ? label.charAt(0).toUpperCase() + label.slice(1) : undefined;
    }

    /**
     * Resolves several entities' labels (FR → EN, capitalised) in one request.
     * Used to turn occupation/citizenship Q-ids into human-readable strings without
     * one round-trip per id. Q-ids with no label are simply absent from the map.
     */
    async resolveLabels(qids: string[]): Promise<Map<string, string>> {
        const out = new Map<string, string>();
        const unique = [...new Set(qids)];
        if (unique.length === 0) return out;
        for (let i = 0; i < unique.length; i += 50) {
            const batch = unique.slice(i, i + 50);
            const url =
                `${this.api}?action=wbgetentities&format=json` +
                `&ids=${batch.join('|')}&props=labels&languages=fr|en`;
            const json = await this.fetchJson(url);
            const entities = (json?.entities ?? {}) as Record<string, RawEntity>;
            for (const [qid, entity] of Object.entries(entities)) {
                const label = entity.labels?.fr?.value ?? entity.labels?.en?.value;
                if (label) out.set(qid, label.charAt(0).toUpperCase() + label.slice(1));
            }
        }
        return out;
    }

    private parseTimeClaim(claim?: RawSnak[]): Date | undefined {
        const value = claim?.[0]?.mainsnak?.datavalue?.value as { time?: string } | undefined;
        return value?.time ? this.parseWikidataTime(value.time) : undefined;
    }

    /** Parses a Wikidata time literal like "+1955-02-24T00:00:00Z" to a UTC Date. */
    parseWikidataTime(time: string): Date | undefined {
        const m = time.match(/^([+-])(\d+)-(\d{2})-(\d{2})/);
        if (!m || m[1] === '-') return undefined; // ignore BCE / malformed
        const year = Number(m[2]);
        const month = m[3] === '00' ? 1 : Number(m[3]);
        const day = m[4] === '00' ? 1 : Number(m[4]);
        return new Date(Date.UTC(year, month - 1, day));
    }

    private async fetchJson(url: string): Promise<any> {
        const res = await fetch(url, {
            headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
        });
        if (!res.ok) {
            this.logger.error(`Wikidata request failed (${res.status}): ${url}`);
            throw new Error(`Wikidata request failed: ${res.status}`);
        }
        return res.json();
    }
}
