import { createFileRoute, Link } from '@tanstack/react-router';
import { Hash, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyCircles } from '@/components/circles/EmptyCircles';
import { GhostAddCard } from '@/components/circles/GhostAddCard';
import { HubCircleCard } from '@/components/circles/HubCircleCard';
import { Segmented, type SegmentOption } from '@/components/circles/Segmented';
import { Button } from '@/components/ui/button';
import type { HubCircle } from '@/types/circle';

export const Route = createFileRoute('/_app/circles/')({
    component: CirclesHub,
});

type HubFilter = 'all' | 'private' | 'public';

// TEMP mock data — replaced by the API (my circles) in the data step.
const CIRCLES: HubCircle[] = [
    {
        id: 'caveau',
        name: 'Caveau de Famille',
        visibility: 'PRIVATE',
        members: 6,
        myRank: '#1',
        rankState: 'lead',
        tag: 'En tête',
        points: 510,
        podium: [
            { place: 1, name: 'Vous', initials: 'CV', points: 510, ring: 'neon' },
            { place: 2, name: 'Margaux', initials: 'MO', points: 470 },
            { place: 3, name: 'Léa', initials: 'LE', points: 360 },
        ],
    },
    {
        id: 'faucheurs',
        name: 'Les Faucheurs du Dimanche',
        visibility: 'PRIVATE',
        members: 8,
        myRank: '#2',
        rankState: 'mid',
        points: 420,
        podium: [
            { place: 1, name: 'Sasha', initials: 'SV', points: 615, ring: 'mag' },
            { place: 2, name: 'Vous', initials: 'CV', points: 420, ring: 'neon' },
            { place: 3, name: 'Léa', initials: 'LK', points: 405 },
        ],
    },
    {
        id: 'bureau',
        name: 'Bureau & Macchabées',
        visibility: 'PRIVATE',
        members: 24,
        myRank: '#5',
        rankState: 'mid',
        points: 410,
        podium: [
            { place: 1, name: 'Priya', initials: 'PR', points: 640, ring: 'mag' },
            { place: 2, name: 'Tom', initials: 'TM', points: 520 },
            { place: 3, name: 'Inès', initials: 'IN', points: 410 },
        ],
    },
    {
        id: 'grim',
        name: 'Grim Reapers FC',
        visibility: 'PUBLIC',
        members: 1820,
        myRank: '#318',
        rankState: 'low',
        points: 9300,
        podium: [
            { place: 1, name: 'Kazu', initials: 'KZ', points: 9820, ring: 'mag' },
            { place: 2, name: 'Nova', initials: 'NV', points: 9510 },
            { place: 3, name: 'Rex', initials: 'RX', points: 9300 },
        ],
    },
];

const FILTERS: SegmentOption<HubFilter>[] = [
    { id: 'all', label: `Tous · ${CIRCLES.length}` },
    {
        id: 'private',
        label: `Privés · ${CIRCLES.filter((c) => c.visibility === 'PRIVATE').length}`,
    },
    { id: 'public', label: `Publics · ${CIRCLES.filter((c) => c.visibility === 'PUBLIC').length}` },
];

function CirclesHub() {
    const [filter, setFilter] = useState<HubFilter>('all');

    const circles = useMemo(() => {
        if (filter === 'all') return CIRCLES;
        const want = filter === 'private' ? 'PRIVATE' : 'PUBLIC';
        return CIRCLES.filter((circle) => circle.visibility === want);
    }, [filter]);

    if (CIRCLES.length === 0) {
        return (
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col p-4 md:p-6">
                <EmptyCircles />
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="mr-auto">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Hub
                    </div>
                    <h1 className="mt-0.5 font-display text-2xl font-extrabold">Mes cercles</h1>
                </div>
                <Button asChild variant="outline">
                    <Link to="/circles/join">
                        <Hash size={17} /> Rejoindre via code
                    </Link>
                </Button>
                <Button asChild>
                    <Link to="/circles/new">
                        <Plus size={17} strokeWidth={2.2} /> Créer un cercle
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Segmented options={FILTERS} value={filter} onValueChange={setFilter} />
                <span className="ml-auto text-[13px] text-ink-3">Saison 2026</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {circles.map((circle) => (
                    <HubCircleCard key={circle.id} circle={circle} />
                ))}
                {filter === 'all' && <GhostAddCard />}
            </div>
        </div>
    );
}
