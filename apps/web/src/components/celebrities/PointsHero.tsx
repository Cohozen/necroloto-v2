import { Skull, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CelebrityStatus } from '@/types/celebrity';

interface PointsHeroProps {
    status: CelebrityStatus;
    points: number;
    year: number;
    odds: number;
    bettors: number;
    deathLabel?: string;
}

/** Points banner — awarded (deceased, coral) or potential (alive, neon). */
export function PointsHero({ status, points, year, odds, bettors, deathLabel }: PointsHeroProps) {
    const dead = status === 'deceased';
    return (
        <div
            className={cn(
                'flex items-center gap-5 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5',
                dead ? 'shadow-glow-coral' : 'shadow-glow-green',
            )}
        >
            <span
                className={cn(
                    'flex size-16 shrink-0 items-center justify-center rounded-2xl',
                    dead ? 'bg-coral/10 text-coral' : 'bg-neon/10 text-neon',
                )}
            >
                {dead ? <Skull size={30} /> : <Zap size={30} />}
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {dead
                        ? 'Points attribués · décès confirmé'
                        : `Gain potentiel · si décès en ${year}`}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                    <span
                        className={cn(
                            'font-display text-5xl font-extrabold leading-none',
                            dead ? 'text-glow-coral' : 'text-glow-neon',
                        )}
                    >
                        +{points}
                    </span>
                    <span className="text-sm text-ink-2">
                        {dead
                            ? `à ${bettors} joueur·s${deathLabel ? ` · ${deathLabel}` : ''}`
                            : `cote ${odds} · ${bettors} parieur·s`}
                    </span>
                </div>
            </div>
        </div>
    );
}
