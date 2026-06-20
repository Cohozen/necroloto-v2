import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface PodiumProps {
    /** Top three entries, ordered by rank (1, 2, 3). */
    top3: LeaderboardEntry[];
}

/** Top-3 podium with the winner raised and glowing (nl-podium). */
export function Podium({ top3 }: PodiumProps) {
    const [first, second, third] = top3;
    return (
        <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-2 sm:gap-3">
            {second && <PodiumCell entry={second} place={2} />}
            {first && <PodiumCell entry={first} place={1} />}
            {third && <PodiumCell entry={third} place={3} />}
        </div>
    );
}

const MEDAL: Record<number, string> = {
    1: 'bg-neon text-bg shadow-glow-soft',
    2: 'bg-[#c8c9d6] text-bg',
    3: 'bg-coral text-bg',
};

function PodiumCell({ entry, place }: { entry: LeaderboardEntry; place: number }) {
    const first = place === 1;
    return (
        <div
            className={cn(
                'relative flex flex-col items-center gap-2 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface px-2 pb-3 pt-4 text-center sm:gap-2.5 sm:px-3 sm:pb-4 sm:pt-5',
                first && 'border-neon/50 shadow-glow-green -translate-y-1.5 sm:-translate-y-3',
                place === 3 && 'border-coral/40',
            )}
        >
            <span
                className={cn(
                    'absolute -top-3 left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full font-display text-[15px] font-extrabold',
                    MEDAL[place],
                )}
            >
                {place}
            </span>
            <Avatar
                className={cn('mt-2',
                    first ? 'size-[48px] sm:size-[60px]' : 'size-[40px] sm:size-[50px]',
                    first && 'ring-2 ring-neon/65 ring-offset-2 ring-offset-bg',
                )}
            >
                <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                    {entry.initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-0.5">
                <div className="flex flex-wrap text-sm font-bold">{entry.name}</div>
                <div className="text-[11px] text-ink-3">{entry.hits} décès marqués</div>
            </div>
            <div
                className={cn(
                    'font-display text-2xl font-extrabold leading-none sm:text-3xl',
                    first && 'text-neon',
                    place === 3 && 'text-coral',
                )}
            >
                {entry.points}
            </div>
            {entry.isYou ? (
                <span className="inline-flex h-[22px] items-center rounded-full border border-neon/40 px-2 text-xs font-semibold text-neon">
                    vous
                </span>
            ) : (
                <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3">pts</span>
            )}
        </div>
    );
}
