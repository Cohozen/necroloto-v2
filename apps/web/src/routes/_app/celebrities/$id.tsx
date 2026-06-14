import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Globe, Plus } from 'lucide-react';
import { BettorRow } from '@/components/celebrities/BettorRow';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { Fact } from '@/components/celebrities/Fact';
import { PointsHero } from '@/components/celebrities/PointsHero';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Button } from '@/components/ui/button';
import type { CelebrityDetail } from '@/types/celebrity';

export const Route = createFileRoute('/_app/celebrities/$id')({
    component: CelebrityPage,
});

const YEAR = new Date().getFullYear();

// TEMP mock data — replaced by the API in the data step. Try /celebrities/gloria
// (deceased) and /celebrities/buck (alive).
const CELEBS: Record<string, CelebrityDetail> = {
    buck: {
        id: 'buck',
        name: 'Buck Thunderlane',
        role: 'Acteur',
        born: 1938,
        age: 87,
        status: 'alive',
        odds: 6.5,
        points: 90,
        bettors: [
            {
                id: 'y',
                name: 'Vous',
                initials: 'ME',
                circle: 'Les Faucheurs du Dimanche',
                isYou: true,
                points: 90,
            },
            { id: 'm', name: 'Mortimer', initials: 'MO', circle: 'Bureau Maudit', points: 90 },
            { id: 'l', name: 'Léa', initials: 'LE', circle: 'Grim Reapers FC', points: 90 },
        ],
    },
    gloria: {
        id: 'gloria',
        name: 'Dame Gloria Ravensworth',
        role: 'Aristocrate',
        born: 1929,
        age: 96,
        status: 'deceased',
        deathLabel: '12 mars 2026',
        odds: 4.2,
        points: 140,
        bettors: [
            {
                id: 'y',
                name: 'Vous',
                initials: 'ME',
                circle: 'Les Faucheurs du Dimanche',
                isYou: true,
                points: 140,
            },
            {
                id: 's',
                name: 'Sasha Volkov',
                initials: 'SV',
                circle: 'Caveau de Famille',
                points: 140,
            },
            { id: 'p', name: 'Priya', initials: 'PR', circle: 'Bureau Maudit', points: 140 },
            {
                id: 'g',
                name: 'Tonton Gégé',
                initials: 'GG',
                circle: 'Grim Reapers FC',
                points: 140,
            },
        ],
    },
};

function CelebrityPage() {
    const { id } = Route.useParams();
    const celeb = CELEBS[id] ?? CELEBS.buck;

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
                <Button variant="outline" size="sm">
                    <Plus size={15} /> Ajouter à mon pari
                </Button>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {celeb.role}
                </span>
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
                        <Fact label="Naissance" value={`°${celeb.born}`} />
                        <Fact label="Âge" value={`${celeb.age} ans`} />
                        <Fact label="Cote" value={celeb.odds} accent />
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                                Catégorie
                            </span>
                            <span className="inline-flex h-[26px] w-fit items-center rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
                                {celeb.role}
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
                        odds={celeb.odds}
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
                        <div className="grid gap-2.5 sm:grid-cols-2">
                            {celeb.bettors.map((bettor) => (
                                <BettorRow key={bettor.id} bettor={bettor} status={celeb.status} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-xs text-ink-3">
                        <Globe size={14} /> Données biographiques synchronisées depuis Wikidata ·
                        maj il y a 3 j
                    </div>
                </div>
            </div>
        </div>
    );
}
