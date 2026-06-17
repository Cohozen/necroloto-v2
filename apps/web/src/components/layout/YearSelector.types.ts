export interface YearSelectorProps {
    /** Currently selected year. */
    value: number;
    /** Called when the user picks another year. */
    onValueChange: (year: number) => void;
    /** Selectable years, newest first. Defaults to the last 4 years. */
    years?: number[];
}
