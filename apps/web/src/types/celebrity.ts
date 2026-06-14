export type CelebrityStatus = 'alive' | 'deceased';

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
    /** Category / occupation, e.g. "Acteur". */
    role: string;
    /** Birth year. */
    born: number;
    age: number;
    status: CelebrityStatus;
    /** Human-readable death date, when deceased. */
    deathLabel?: string;
    /** Betting odds (cote). */
    odds: number;
    /** Points awarded (deceased) or potential (alive). */
    points: number;
    bettors: Bettor[];
}
