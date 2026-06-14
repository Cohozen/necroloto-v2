import { cn } from '@/lib/utils';
import type { PlayerStat } from '@/types/profile';

const iconTone = {
    default: 'text-neon bg-neon/10 border-neon/25',
    coral: 'text-coral bg-coral/10 border-coral/25',
    mag: 'text-magenta bg-magenta/10 border-magenta/25',
} as const;

const valueTone = {
    default: 'text-ink',
    coral: 'text-coral',
    mag: 'text-magenta',
} as const;

/** Single profile stat (nl-stat-tile) — icon, big figure, label, optional pill. */
export function StatTile({ icon: Icon, value, label, tone = 'default', chip }: PlayerStat) {
    return (
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-[15px] border border-line bg-surface p-4">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent opacity-60" />
            <div className="flex items-center justify-between">
                <div
                    className={cn(
                        'flex size-8 items-center justify-center rounded-[9px] border',
                        iconTone[tone],
                    )}
                >
                    <Icon size={18} />
                </div>
                {chip && (
                    <span className="inline-flex h-[22px] items-center rounded-full border border-line-2 bg-surface-3 px-2 text-[11px] font-semibold text-ink-2">
                        {chip}
                    </span>
                )}
            </div>
            <div
                className={cn(
                    'font-display text-[34px] font-extrabold leading-[0.9] tabular-nums',
                    valueTone[tone],
                )}
            >
                {value}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                {label}
            </div>
        </div>
    );
}
