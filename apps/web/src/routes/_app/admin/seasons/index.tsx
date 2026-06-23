import { createFileRoute, Link } from '@tanstack/react-router';
import { CalendarRange, ChevronRight, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { Button } from '@/components/ui/button';
import { seasonStatus } from '@/lib/api/adapters';
import { useSeasons } from '@/lib/api/queries';
import type { ApiSeason } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { SEASON_STATUS_LABEL, type SeasonStatus } from '@/types/season';

export const Route = createFileRoute('/_app/admin/seasons/')({
    component: AdminSeasons,
});

const STATUS_STYLE: Record<SeasonStatus, string> = {
    upcoming: 'border-line-2 bg-surface text-ink-2',
    open: 'border-neon/40 bg-neon/10 text-neon',
    'bets-open': 'border-neon/40 bg-neon/10 text-neon',
    closed: 'border-line-2 bg-surface text-ink-3',
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
function fmt(iso: string): string {
    return dateFmt.format(new Date(iso));
}

function SeasonRow({ season }: { season: ApiSeason }) {
    const status = seasonStatus(season);
    return (
        <Link
            to="/admin/seasons/$id"
            params={{ id: season.id }}
            className="flex items-center gap-4 rounded-xl border border-line-2 bg-surface px-4 py-3.5 transition-colors hover:border-line"
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2">
                <CalendarRange size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                    <span className="font-display text-lg font-extrabold">{season.year}</span>
                    {season.name && <span className="text-[13px] text-ink-3">{season.name}</span>}
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                            STATUS_STYLE[status],
                        )}
                    >
                        {SEASON_STATUS_LABEL[status]}
                    </span>
                </div>
                <p className="mt-1 text-[12px] text-ink-3">
                    Paris : {fmt(season.betStartDate)} → {fmt(season.betEndDate)}
                </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-ink-3" />
        </Link>
    );
}

function AdminSeasons() {
    const { data, isLoading, isError } = useSeasons();
    const seasons = useMemo(() => data ?? [], [data]);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader
                section="Saisons"
                crumb="Toutes les saisons"
                actions={
                    <Button asChild size="sm">
                        <Link to="/admin/seasons/new">
                            <Plus size={15} strokeWidth={2.4} /> Nouvelle saison
                        </Link>
                    </Button>
                }
            />
            {isLoading ? (
                <SectionLoader label="Chargement des saisons…" />
            ) : isError ? (
                <p className="py-12 text-center text-sm text-coral">
                    Les saisons n'ont pas pu être chargées.
                </p>
            ) : seasons.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-3">
                    Aucune saison configurée. Créez-en une pour ouvrir les paris.
                </p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {seasons.map((season) => (
                        <SeasonRow key={season.id} season={season} />
                    ))}
                </div>
            )}
        </div>
    );
}
