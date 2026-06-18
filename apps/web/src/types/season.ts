/** Lifecycle state of a season, derived from its dates relative to now. */
export type SeasonStatus = 'upcoming' | 'open' | 'bets-open' | 'closed';

/** UI view model for a season (admin screens). Dates are ISO strings. */
export interface Season {
    id: string;
    year: number;
    name: string | null;
    openDate: string;
    betStartDate: string;
    betEndDate: string;
    closeDate: string;
    /** Derived from the dates vs. now. */
    status: SeasonStatus;
}

/** Human-readable French label for each season status. */
export const SEASON_STATUS_LABEL: Record<SeasonStatus, string> = {
    upcoming: 'À venir',
    open: 'Ouverte',
    'bets-open': 'Paris ouverts',
    closed: 'Clôturée',
};
