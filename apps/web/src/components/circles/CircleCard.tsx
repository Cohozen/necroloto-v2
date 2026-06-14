import { Link } from '@tanstack/react-router';
import { ChevronRight, Users, Zap } from 'lucide-react';
import { AvatarStack } from '@/components/AvatarStack';
import { Logo } from '@/components/layout/Logo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CircleCardProps } from './CircleCard.types';
import { PrivacyBadge } from './PrivacyBadge';

/** Circle summary card (nl-circle) — used on the dashboard and the circles hub. */
export function CircleCard({ circle }: CircleCardProps) {
    const { id, name, members, rank, points, isLeader, topMembers, visibility } = circle;
    const rankStr = `#${rank}`;
    return (
        <Link
            to="/circles/$id"
            params={{ id }}
            className={cn(
                'relative flex flex-col gap-3.5 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-[18px] transition-colors hover:border-line-2',
                isLeader && 'shadow-glow-green',
            )}
        >
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] border border-line-2 bg-surface-3">
                        <Logo cell={2} />
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-base font-bold">{name}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <PrivacyBadge visibility={visibility} />
                            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
                                <Users size={13} /> {members}
                            </span>
                        </div>
                    </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-ink-3" />
            </div>

            <div className="flex items-center justify-between gap-2.5">
                <AvatarStack people={topMembers} size={34} />
                {isLeader ? (
                    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta/12 px-2.5 text-xs font-bold text-magenta">
                        <Zap size={13} /> En tête
                    </span>
                ) : (
                    <span className="text-xs text-ink-3">vous • {rankStr}</span>
                )}
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-line pt-[11px]">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                        Votre rang
                    </span>
                    <b
                        className={cn(
                            'font-display text-3xl font-extrabold leading-none',
                            isLeader && 'text-neon',
                        )}
                    >
                        {rankStr}
                    </b>
                </div>
                <Badge
                    variant={isLeader ? 'score' : 'secondary'}
                    className="h-[30px] font-display text-base"
                >
                    {points} pts
                </Badge>
            </div>
        </Link>
    );
}
