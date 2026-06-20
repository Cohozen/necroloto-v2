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
    /** Points awarded once deceased (0 while alive). */
    points: number;
    /** Number of lists betting on this celebrity. */
    bettors: number;
}

export type CatalogFilter = 'all' | 'alive' | 'deceased' | 'pending';
