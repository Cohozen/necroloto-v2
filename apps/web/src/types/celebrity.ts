export type CelebrityStatus = 'alive' | 'deceased';

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
    /** Coarse category used for filtering, when known. */
    category?: string;
}

export interface Bettor {
    id: string;
    name: string;
    initials: string;
    /** Circle this player bet from. */
    circle: string;
    isYou?: boolean;
    /** Points scored (deceased) or potential points (alive). */
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
    bettors: Bettor[];
}
