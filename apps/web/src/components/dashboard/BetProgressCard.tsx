import { Link } from '@tanstack/react-router';
import { Lock, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BetProgressCardProps {
    year: number;
    selected: number;
    total: number;
    /** e.g. "clôture 31 déc." */
    closesLabel: string;
    /** Name of the circle this bet belongs to, if any. */
    circleName?: string;
}

/** "Pari en cours" card with selection progress (nl-card + nl-bar). */
export function BetProgressCard({
    year,
    selected,
    total,
    closesLabel,
    circleName,
}: BetProgressCardProps) {
    const pct = Math.round((selected / total) * 100);
    return (
        <div className="relative flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5">
            <div className="flex items-center justify-between gap-2.5">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Pari en cours
                    </div>
                    <div className="mt-1 text-lg font-semibold">Saison {year}</div>
                    {circleName && (
                        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
                            <Users size={13} /> {circleName}
                        </div>
                    )}
                </div>
                <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-coral/40 bg-coral/10 px-2.5 text-xs font-semibold text-coral">
                    <Lock size={13} /> {closesLabel}
                </span>
            </div>
            <div className="flex items-end gap-3.5">
                <div className="font-display text-5xl font-extrabold leading-none">
                    {selected}
                    <span className="text-[0.6em] text-ink-3"> / {total}</span>
                </div>
                <div className="pb-1.5 text-[13px] text-ink-2">
                    célébrités
                    <br />
                    sélectionnées
                </div>
            </div>
            <div className="h-[7px] overflow-hidden rounded-full bg-surface-3">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-neon to-magenta shadow-glow-soft"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <Button asChild className="w-full">
                <Link to="/celebrities">
                    <Zap size={16} /> Continuer mon pari
                </Link>
            </Button>
        </div>
    );
}
