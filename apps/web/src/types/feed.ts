export interface DeathFeedEntry {
    id: string;
    celebrityName: string;
    age: number;
    /** Number of players who scored points from this death. */
    scorers: number;
    /** Human-readable relative time, e.g. "il y a 2 j". */
    when: string;
    points: number;
}
