import { cn } from '@/lib/utils';

interface YearTabsProps {
    value: number;
    onValueChange: (year: number) => void;
    years: number[];
    className?: string;
}

/** Segmented year filter (nl-tabs). */
export function YearTabs({ value, onValueChange, years, className }: YearTabsProps) {
    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-xl border border-line bg-surface p-1',
                className,
            )}
        >
            {years.map((year) => (
                <button
                    key={year}
                    type="button"
                    onClick={() => onValueChange(year)}
                    className={cn(
                        'rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-ink-2 transition-colors',
                        year === value
                            ? 'bg-neon text-neon-ink shadow-glow-soft'
                            : 'hover:text-ink',
                    )}
                >
                    {year}
                </button>
            ))}
        </div>
    );
}
