import { ChevronRight, Ghost } from 'lucide-react';

interface ScoringInsetProps {
    /** When deceased, show the before/after credit; otherwise the idle note. */
    deceased: boolean;
    year: number;
    /** Points credited on death. */
    points: number;
    /** Number of lists betting on the death year. */
    creditedLists: number;
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                {label}
            </span>
            <span className={`font-display text-xl font-extrabold ${tone ?? 'text-ink'}`}>
                {value}
            </span>
        </div>
    );
}

/** recalculatePoints explainer — idle (alive) or before/after credit (deceased). */
export function ScoringInset({ deceased, year, points, creditedLists }: ScoringInsetProps) {
    if (!deceased) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-[18px]">
                <Ghost size={28} className="shrink-0 text-ink-3" />
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Recalcul des points · en veille
                    </div>
                    <p className="mt-1 max-w-[60ch] text-[13px] text-ink-3">
                        Aucun décès renseigné. Les points ne seront distribués qu'au décès de la
                        célébrité — et seulement aux listes pariées sur l'année du décès.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-coral/30 bg-surface p-[18px] shadow-glow-coral">
            <div className="flex items-start gap-3">
                <Ghost
                    size={28}
                    className="shrink-0 text-coral drop-shadow-[0_0_9px_rgb(var(--coral-rgb)/0.6)]"
                />
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
                        Recalcul automatique · recalculatePoints
                    </div>
                    <p className="mt-1 max-w-[58ch] text-[13px] text-ink-3">
                        Renseigner une date de décès <b className="text-ink-2">en {year}</b> crédite
                        les listes ayant parié sur cette saison. Les listes des saisons passées ne
                        marquent <b className="text-ink-2">pas</b> de points.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-5 border-t border-line pt-4">
                <MiniKpi label="Avant" value="0 pt" tone="text-ink-3" />
                <ChevronRight size={22} strokeWidth={2} className="text-ink-3" />
                <MiniKpi label="Après" value={`+${points}`} tone="text-coral" />
                <div className="self-stretch border-l border-line" />
                <MiniKpi label="Listes 2026 créditées" value={String(creditedLists)} />
            </div>
        </div>
    );
}
