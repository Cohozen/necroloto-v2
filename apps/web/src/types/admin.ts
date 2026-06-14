import type { CelebrityStatus } from './celebrity';

/** A celebrity row as seen in the admin catalogue table. */
export interface AdminCelebrity {
    id: string;
    name: string;
    role: string;
    /** Birth year. */
    born: number;
    status: CelebrityStatus;
    /** Points awarded once deceased (0 while alive). */
    points: number;
    /** Number of lists betting on this celebrity. */
    bettors: number;
}

export type CatalogFilter = 'all' | 'alive' | 'deceased';

/** Editable celebrity fiche (admin form). */
export interface CelebrityFormData {
    id: string;
    name: string;
    /** Human-readable birth date, e.g. "12 février 1929". */
    bornLabel: string;
    bornYear: number;
    /** Wikidata QID, e.g. "Q462359". */
    wikidataQid: string;
    deceased: boolean;
    /** Human-readable death date, e.g. "14 mars 2026". */
    deathLabel: string;
    points: number;
    bettors: number;
}
