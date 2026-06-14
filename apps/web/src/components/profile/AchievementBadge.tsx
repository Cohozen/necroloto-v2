import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types/profile';

const medalTone = {
    default:
        'text-neon border-neon/40 shadow-glow-soft [background:radial-gradient(120%_120%_at_30%_20%,rgb(var(--neon-rgb)/0.28),var(--color-surface-3))]',
    coral: 'text-coral border-coral/40 shadow-glow-coral [background:radial-gradient(120%_120%_at_30%_20%,rgb(var(--coral-rgb)/0.28),var(--color-surface-3))]',
    mag: 'text-magenta border-magenta/40 shadow-glow-mag [background:radial-gradient(120%_120%_at_30%_20%,rgb(var(--magenta-rgb)/0.28),var(--color-surface-3))]',
} as const;

/** Arcade trophy badge (nl-badge) — unlocked tones or a locked, dimmed state. */
export function AchievementBadge({
    icon: Icon,
    title,
    description,
    tone = 'default',
    locked,
}: Achievement) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-2 rounded-[14px] border border-line bg-surface px-2.5 py-4 text-center',
                locked && 'opacity-50',
            )}
        >
            <div
                className={cn(
                    'flex size-[52px] items-center justify-center rounded-[15px] border',
                    locked ? 'border-line bg-surface-3 text-ink-3' : medalTone[tone],
                )}
            >
                {locked ? <Lock size={22} /> : <Icon size={22} />}
            </div>
            <div className="text-xs font-bold leading-tight">{title}</div>
            <div className="text-[10.5px] text-ink-3">{description}</div>
        </div>
    );
}
