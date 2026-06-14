import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface LeaderboardRowProps {
    entry: LeaderboardEntry;
    isLast?: boolean;
    /** Hide the "mises" count (mobile). */
    compact?: boolean;
}

/** A single leaderboard row (nl-lbrow) with leader / me / last states. */
export function LeaderboardRow({ entry, isLast, compact }: LeaderboardRowProps) {
    const leader = entry.rank === 1;
    const me = entry.isYou;
    return (
        <div
            className={cn(
                'grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface px-3 py-[11px] md:grid-cols-[44px_1fr_auto] md:gap-4 md:px-4',
                leader &&
                    'border-neon/45 bg-gradient-to-r from-neon/10 to-surface shadow-glow-soft',
                isLast && 'border-coral/35 bg-gradient-to-r from-coral/8 to-surface',
                me && 'outline outline-1 outline-dashed outline-neon/50',
            )}
        >
            <span
                className={cn(
                    'text-center font-display text-2xl font-extrabold tabular-nums',
                    leader ? 'text-neon' : 'text-ink-3',
                )}
            >
                {String(entry.rank).padStart(2, '0')}
            </span>
            <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-xs font-extrabold text-[#07140b]">
                        {entry.initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate font-semibold">
                        {entry.name}
                        {me && <span className="text-neon"> · vous</span>}
                    </div>
                    <div className="truncate text-xs text-ink-3">
                        {isLast ? (
                            <span className="text-glow-coral">lanterne rouge</span>
                        ) : (
                            `${entry.hits} décès`
                        )}{' '}
                        · {entry.streak ? `série ${entry.streak}` : '—'}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {!compact && (
                    <span className="hidden text-[11px] text-ink-3 sm:inline">
                        {entry.bets} mises
                    </span>
                )}
                <div className="text-right font-display text-2xl font-extrabold tabular-nums text-ink">
                    {entry.points}
                    <small className="block font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                        pts
                    </small>
                </div>
            </div>
        </div>
    );
}
