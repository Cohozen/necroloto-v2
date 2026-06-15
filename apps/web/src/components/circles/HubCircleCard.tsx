import { Link } from '@tanstack/react-router';
import { ChevronRight, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HubCircle } from '@/types/circle';
import { MiniPodium } from './MiniPodium';
import { PrivacyBadge } from './PrivacyBadge';

const fmt = (n: number) => n.toLocaleString('fr-FR');

/** Rich circle card for the "Mes cercles" hub — crest, mini-podium, my rank + score. */
export function HubCircleCard({ circle }: { circle: HubCircle }) {
    const lead = circle.rankState === 'lead';
    return (
        <article
            className={cn(
                'flex flex-col gap-3.5 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-[18px]',
                lead && 'shadow-glow-green',
            )}
        >
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] border border-line-2 bg-surface-3">
                        <Logo cell={2} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="truncate text-base font-bold leading-tight">
                            {circle.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <PrivacyBadge visibility={circle.visibility} />
                            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
                                <Users size={13} /> {fmt(circle.members)}
                            </span>
                            {circle.tag && (
                                <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta/12 px-2.5 text-xs font-bold text-magenta">
                                    <Zap size={12} /> {circle.tag}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-ink-3" />
            </div>

            <MiniPodium podium={circle.podium} />

            <div className="flex items-end justify-between gap-3 border-t border-line pt-[13px]">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                        Mon rang
                    </span>
                    <b
                        className={cn(
                            'font-display text-[26px] font-extrabold leading-none',
                            lead
                                ? 'text-neon'
                                : circle.rankState === 'low'
                                  ? 'text-ink-2'
                                  : 'text-ink',
                        )}
                    >
                        {circle.myRank}
                    </b>
                </div>
                <div className="flex items-center gap-2.5">
                    <span
                        className={cn(
                            'inline-flex h-[30px] items-center rounded-full px-2.5 font-display text-base font-bold',
                            lead
                                ? 'border border-neon/40 bg-neon/10 text-neon shadow-glow-soft'
                                : 'bg-surface-3 text-ink-2',
                        )}
                    >
                        {fmt(circle.points)} pts
                    </span>
                    <Button asChild size="sm" variant={lead ? 'default' : 'outline'}>
                        <Link to="/circles/$id" params={{ id: circle.id }}>
                            Voir
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
