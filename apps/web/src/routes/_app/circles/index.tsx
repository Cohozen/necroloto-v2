import { createFileRoute, Link } from '@tanstack/react-router';
import { Hash, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyCircles } from '@/components/circles/EmptyCircles';
import { GhostAddCard } from '@/components/circles/GhostAddCard';
import { HubCircleCard } from '@/components/circles/HubCircleCard';
import { Segmented, type SegmentOption } from '@/components/circles/Segmented';
import { Button } from '@/components/ui/button';
import { toHubCircle } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useCircleSummaries } from '@/lib/api/queries';

export const Route = createFileRoute('/_app/circles/')({
    component: CirclesHub,
});

type HubFilter = 'all' | 'private' | 'public';

function CirclesHub() {
    const [filter, setFilter] = useState<HubFilter>('all');
    const { user } = useCurrentUser();
    const summaries = useCircleSummaries(user?.id);

    const allCircles = useMemo(() => (summaries.data ?? []).map(toHubCircle), [summaries.data]);

    const circles = useMemo(() => {
        if (filter === 'all') return allCircles;
        const want = filter === 'private' ? 'PRIVATE' : 'PUBLIC';
        return allCircles.filter((circle) => circle.visibility === want);
    }, [filter, allCircles]);

    const filters: SegmentOption<HubFilter>[] = [
        { id: 'all', label: `Tous · ${allCircles.length}` },
        {
            id: 'private',
            label: `Privés · ${allCircles.filter((c) => c.visibility === 'PRIVATE').length}`,
        },
        {
            id: 'public',
            label: `Publics · ${allCircles.filter((c) => c.visibility === 'PUBLIC').length}`,
        },
    ];

    if (summaries.isLoading) {
        return (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <p className="text-[13px] text-ink-3">Chargement de vos cercles…</p>
            </div>
        );
    }

    if (summaries.isError) {
        return (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <p className="text-[13px] text-coral">
                    Impossible de charger vos cercles. Réessayez plus tard.
                </p>
            </div>
        );
    }

    if (allCircles.length === 0) {
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
                        <Hash size={17} /> Rejoindre{' '}
                        <span className="hidden md:inline">via code</span>
                    </Link>
                </Button>
                <Button asChild>
                    <Link to="/circles/new">
                        <Plus size={17} strokeWidth={2.2} />{' '}
                        <span className="hidden md:inline">Créer un cercle</span>
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Segmented options={filters} value={filter} onValueChange={setFilter} />
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
