import { ArrowUp, Flame } from 'lucide-react';
import { Kpi } from './Kpi';

interface ScoreBandProps {
    year: number;
    score: number;
    streak: number;
    weekDelta: number;
    circles: number;
    deaths: number;
    bestRank: string;
}

const fmt = (n: number) => n.toLocaleString('fr-FR');

/** Hero stat band — global score + key figures (nl-glow-green card). */
export function ScoreBand({
    year,
    score,
    streak,
    weekDelta,
    circles,
    deaths,
    bestRank,
}: ScoreBandProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5 shadow-glow-green md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Score global · {year}
                    </span>
                    <div className="font-display text-6xl font-extrabold leading-none text-glow-neon md:text-7xl">
                        {fmt(score)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta/12 px-2.5 text-xs font-bold text-magenta">
                            <Flame size={13} /> Série {streak}
                        </span>
                        <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-2.5 text-xs font-semibold text-neon">
                            <ArrowUp size={12} /> +{weekDelta} cette sem.
                        </span>
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-3 gap-4 border-t border-line pt-4 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                    <Kpi value={circles} label="Cercles" />
                    <Kpi value={deaths} label="Décès marqués" tone="coral" />
                    <Kpi value={bestRank} label="Meilleur rang" />
                </div>
            </div>
        </div>
    );
}
