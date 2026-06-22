import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { LeaderPick } from '@/types/leaderboard';

interface LeaderPicksCardProps {
    name: string;
    initials: string;
    points: number;
    hits: number;
    picks: LeaderPick[];
    /** Allow folding the picks list behind a chevron (collapsed by default). */
    collapsible?: boolean;
}

/** "Mises de [player]" rail — a player's bet list with per-pick status. */
export function LeaderPicksCard({
    name,
    initials,
    points,
    hits,
    picks,
    collapsible = false,
}: LeaderPicksCardProps) {
    const [open, setOpen] = useState(!collapsible);
    const header = (
        <>
            <div className="flex items-center gap-3">
                <Avatar className="size-[38px] ring-2 ring-neon/65 ring-offset-2 ring-offset-bg">
                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-xs font-extrabold text-[#07140b]">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Mises de
                    </div>
                    <div className="truncate font-bold">{name}</div>
                </div>
                {collapsible && (
                    <ChevronDown
                        size={18}
                        className={cn(
                            'ml-auto shrink-0 text-ink-3 transition-transform',
                            open && 'rotate-180',
                        )}
                    />
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="score" className="font-display text-base">
                    {points} pts
                </Badge>
                <Badge variant="secondary">{hits} décès</Badge>
                <Badge variant="secondary">{picks.length} célébrités</Badge>
            </div>
        </>
    );

    return (
        <div className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-[18px]">
            {collapsible ? (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="flex flex-col gap-3.5 text-left"
                >
                    {header}
                </button>
            ) : (
                header
            )}
            {open && (
                <>
                    <Separator className="bg-line" />
                    <div className="flex flex-col gap-2">
                        {picks.map((pick) => {
                            const dead = pick.status === 'deceased';
                            return (
                                <Link
                                    key={pick.id}
                                    to="/celebrities/$id"
                                    params={{ id: pick.id }}
                                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:border-line-2 hover:bg-surface-2 data-[dead=true]:border-coral/30"
                                    data-dead={dead}
                                >
                                    <CelebrityPortrait
                                        name={pick.name}
                                        status={pick.status}
                                        rounded="rounded-lg"
                                        className="size-[38px] shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[13px] font-semibold">
                                            {pick.name}
                                        </div>
                                        <div className="text-[11px] text-ink-3">{pick.role}</div>
                                    </div>
                                    {dead ? (
                                        <Badge
                                            variant="score"
                                            className="border-coral/40 bg-coral/12 font-display text-coral"
                                        >
                                            +{pick.points}
                                        </Badge>
                                    ) : (
                                        <span className="size-2 animate-pulse-dot rounded-full bg-neon" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
