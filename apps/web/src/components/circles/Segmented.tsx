import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
    id: T;
    label: string;
}

interface SegmentedProps<T extends string> {
    options: SegmentOption<T>[];
    value: T;
    onValueChange: (value: T) => void;
}

/** Segmented filter control (nl-seg) — active segment glows neon. */
export function Segmented<T extends string>({ options, value, onValueChange }: SegmentedProps<T>) {
    return (
        <div className="inline-flex gap-[3px] rounded-[11px] border border-line bg-surface p-1">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onValueChange(option.id)}
                    className={cn(
                        'whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors',
                        value === option.id
                            ? 'bg-neon text-neon-ink shadow-glow-soft'
                            : 'text-ink-2 hover:text-ink',
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
