import { cn } from '@/lib/utils';

interface FactProps {
    label: string;
    value: string | number;
    /** Highlight the value with the neon accent. */
    accent?: boolean;
}

/** Labelled figure used in the celebrity fact grid. */
export function Fact({ label, value, accent }: FactProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                {label}
            </span>
            <span className={cn('font-display text-[26px] font-extrabold', accent && 'text-neon')}>
                {value}
            </span>
        </div>
    );
}
