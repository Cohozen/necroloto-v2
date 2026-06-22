import type { CelebrityStatus } from './celebrity';

export interface LeaderboardEntry {
    id: string;
    name: string;
    initials: string;
    rank: number;
    points: number;
    /** Deaths that scored (décès marqués). */
    hits: number;
    streak?: number;
    /** Number of celebrities bet on (mises). */
    bets: number;
    isYou?: boolean;
}

export interface LeaderPick {
    id: string;
    name: string;
    role: string;
    status: CelebrityStatus;
    /** Portrait URL (Wikidata/upload), when known — falls back to a monogram. */
    photo?: string | null;
    /** Points scored, when deceased. */
    points?: number;
}
