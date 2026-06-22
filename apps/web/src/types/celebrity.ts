export type CelebrityStatus = 'alive' | 'deceased';

/** Validation lifecycle, orthogonal to the alive/deceased axis. */
export type CelebrityProposalStatus = 'pending' | 'approved' | 'rejected';

export interface CelebritySummary {
    id: string;
    name: string;
    /** Age in years (current age if alive, age at death otherwise); 0 if birth unknown. */
    age: number;
    /** Birth year, 0 when unknown. */
    born: number;
    /** Occupation, when known. */
    role?: string;
    status: CelebrityStatus;
    /** Validation lifecycle — `pending` rows are user proposals awaiting an admin. */
    proposalStatus: CelebrityProposalStatus;
    /** Coarse category used for filtering, when known. */
    category?: string;
    /** Portrait URL (Wikidata/upload), when known — falls back to a monogram. */
    photo?: string;
}

/**
 * Outcome of a bet on this celebrity, per bet year:
 * - `scored`   — the celebrity died in the bet's year (points awarded),
 * - `potential` — the bet is still live (current/future season, no death yet),
 * - `missed`   — the bet's year is over (or the death fell in another year) without scoring.
 */
export type BettorOutcome = 'scored' | 'potential' | 'missed';

export interface Bettor {
    id: string;
    name: string;
    initials: string;
    /** Circle this player bet from. */
    circle: string;
    /** Season year of the bet — used to group bettors by season on the fiche. */
    year: number;
    isYou?: boolean;
    outcome: BettorOutcome;
    /** Points scored (`scored`) or potential points (`potential`); 0 when `missed`. */
    points: number;
}

export interface CelebrityDetail {
    id: string;
    name: string;
    /** Occupation, e.g. "Acteur", when known. */
    role?: string;
    /** Coarse category used for the chip, when known. */
    category?: string;
    /** Birth year, 0 when unknown. */
    born: number;
    age: number;
    status: CelebrityStatus;
    /** Human-readable death date, when deceased. */
    deathLabel?: string;
    /** Points awarded (deceased) or potential if death this year (alive). */
    points: number;
    /** Portrait URL (Wikidata/upload), when known — falls back to a monogram. */
    photo?: string;
    /** Wikidata entity id (e.g. "Q42"), when linked — powers the Wikidata link. */
    wikidataId?: string;
    bettors: Bettor[];
}
