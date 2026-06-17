import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Bettor, CelebrityStatus } from '@/types/celebrity';

interface BettorRowProps {
    bettor: Bettor;
    status: CelebrityStatus;
}

/** A player who bet on this celebrity, in one of your circles. */
export function BettorRow({ bettor, status }: BettorRowProps) {
    const dead = status === 'deceased';
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl border bg-surface p-[11px] px-3',
                bettor.isYou ? 'border-neon/40' : 'border-line',
            )}
        >
            <Avatar
                className={cn(
                    'size-10',
                    bettor.isYou && 'ring-2 ring-neon/65 ring-offset-2 ring-offset-bg',
                )}
            >
                <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-xs font-extrabold text-[#07140b]">
                    {bettor.initials}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">
                    {bettor.name}
                    {bettor.isYou && <span className="text-neon"> · vous</span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                    <Users size={11} /> <span className="truncate">{bettor.circle}</span>
                </div>
            </div>
            {dead ? (
                <Badge
                    variant="score"
                    className="border-coral/40 bg-coral/12 font-display text-base text-coral"
                >
                    +{bettor.points}
                </Badge>
            ) : (
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-ink-3">
                        potentiel
                    </div>
                    <div className="font-mono font-bold text-neon">+{bettor.points}</div>
                </div>
            )}
        </div>
    );
}
