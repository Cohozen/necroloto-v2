import type { CelebrityProposalStatus, CelebrityStatus } from './celebrity';

/** A celebrity row as seen in the admin catalogue table. */
export interface AdminCelebrity {
    id: string;
    name: string;
    role: string;
    /** Birth year. */
    born: number;
    status: CelebrityStatus;
    /** Validation lifecycle — drives the pending review actions. */
    proposalStatus: CelebrityProposalStatus;
    /** Whether the entry is linked to a Wikidata entity. */
    hasWikidata: boolean;
    /** Gender label (Homme/Femme/Autre) — agrees the status wording. */
    gender?: string;
    /** Portrait URL (Wikidata/upload), when known — falls back to a monogram. */
    photo?: string;
    /** Points awarded once deceased (0 while alive). */
    points: number;
    /** Number of lists betting on this celebrity. */
    bettors: number;
}

/** Status axis of the admin catalogue (Wikidata-link is an orthogonal axis). */
export type CatalogFilter = 'all' | 'alive' | 'deceased' | 'pending';
