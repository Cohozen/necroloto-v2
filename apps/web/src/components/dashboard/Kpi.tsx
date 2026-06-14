import { cn } from '@/lib/utils';

interface KpiProps {
    value: string | number;
    label: string;
    tone?: 'default' | 'coral';
}

/** Single key figure (nl-kpi). */
export function Kpi({ value, label, tone = 'default' }: KpiProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span
                className={cn(
                    'font-display text-[26px] font-extrabold leading-[0.9] md:text-[40px]',
                    tone === 'coral' && 'text-coral',
                )}
            >
                {value}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                {label}
            </span>
        </div>
    );
}
