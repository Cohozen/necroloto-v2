import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Globe, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { BettorRow } from '@/components/celebrities/BettorRow';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { Fact } from '@/components/celebrities/Fact';
import { PointsHero } from '@/components/celebrities/PointsHero';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Button } from '@/components/ui/button';
import { toCelebrityDetail } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { CURRENT_YEAR, useCelebrity, useCircleSummaries } from '@/lib/api/queries';

export const Route = createFileRoute('/_app/celebrities/$id')({
    component: CelebrityPage,
});

const YEAR = CURRENT_YEAR;

function CelebrityPage() {
    const { id } = Route.useParams();
    const { user } = useCurrentUser();
    const celebQuery = useCelebrity(id);
    const summariesQuery = useCircleSummaries(user?.id);

    const celeb = useMemo(() => {
        if (!celebQuery.data) return null;
        const myCircleIds = new Set((summariesQuery.data ?? []).map((c) => c.id));
        return toCelebrityDetail(celebQuery.data, myCircleIds, user?.id);
    }, [celebQuery.data, summariesQuery.data, user?.id]);

    if (celebQuery.isLoading) {
        return <p className="p-6 text-sm text-ink-3">Chargement de la fiche…</p>;
    }
    if (!celeb) {
        return <p className="p-6 text-sm text-coral">Célébrité introuvable.</p>;
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <Link
                    to="/celebrities"
                    aria-label="Retour au catalogue"
                    className="inline-flex size-[38px] items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2"
                >
                    <ChevronLeft size={18} />
                </Link>
                <span className="text-[13px] text-ink-3">
                    Catalogue <span className="opacity-50">/</span>{' '}
                    <span className="text-ink">Fiche célébrité</span>
                </span>
                <div className="flex-1" />
                <Button variant="outline" size="sm" asChild>
                    <Link to="/celebrities">
                        <Plus size={15} /> Ajouter à mon pari
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-1">
                {celeb.role && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        {celeb.role}
                    </span>
                )}
                <h1 className="font-display text-4xl font-extrabold leading-none md:text-6xl">
                    {celeb.name}
                </h1>
            </div>

            <div className="grid gap-5 md:gap-6 lg:grid-cols-[360px_1fr]">
                {/* portrait + facts */}
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <CelebrityPortrait
                            name={celeb.name}
                            status={celeb.status}
                            className="aspect-square w-full"
                        />
                        <div className="absolute bottom-4 left-4 z-10">
                            <StatusBadge status={celeb.status} deathLabel={celeb.deathLabel} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-surface p-[18px]">
                        <Fact label="Naissance" value={celeb.born > 0 ? `°${celeb.born}` : '—'} />
                        <Fact label="Âge" value={celeb.age > 0 ? `${celeb.age} ans` : '—'} />
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                                Catégorie
                            </span>
                            <span className="inline-flex h-[26px] w-fit items-center rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
                                {celeb.category ?? '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* info */}
                <div className="flex flex-col gap-5">
                    <PointsHero
                        status={celeb.status}
                        points={celeb.points}
                        year={YEAR}
                        bettors={celeb.bettors.length}
                        deathLabel={celeb.deathLabel}
                    />

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Qui a parié dessus</h2>
                            <span className="text-xs text-ink-3">
                                dans vos cercles · {celeb.bettors.length} joueur·s
                            </span>
                        </div>
                        {celeb.bettors.length === 0 ? (
                            <p className="rounded-xl border border-line bg-surface p-4 text-[13px] text-ink-3">
                                Personne dans vos cercles n'a parié sur cette célébrité.
                            </p>
                        ) : (
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                {celeb.bettors.map((bettor) => (
                                    <BettorRow
                                        key={bettor.id}
                                        bettor={bettor}
                                        status={celeb.status}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-xs text-ink-3">
                        <Globe size={14} /> Données biographiques synchronisées depuis Wikidata
                    </div>
                </div>
            </div>
        </div>
    );
}
