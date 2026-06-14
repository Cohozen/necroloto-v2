import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { CircleCard } from '@/components/circles/CircleCard';
import { BetProgressCard } from '@/components/dashboard/BetProgressCard';
import { DeathFeedItem } from '@/components/dashboard/DeathFeedItem';
import { ScoreBand } from '@/components/dashboard/ScoreBand';
import type { CircleSummary } from '@/types/circle';
import type { DeathFeedEntry } from '@/types/feed';

export const Route = createFileRoute('/_app/dashboard')({
    component: Dashboard,
});

// TEMP mock data — replaced by the API (lib/api + TanStack Query) in the data step.
const YEAR = new Date().getFullYear();

const CIRCLES: CircleSummary[] = [
    {
        id: '2',
        name: 'Bureau & Macchabées',
        visibility: 'PUBLIC',
        members: 24,
        rank: 1,
        points: 615,
        isLeader: true,
        topMembers: [
            { id: 'a', initials: 'SV', ring: 'mag' },
            { id: 'b', initials: 'LE' },
            { id: 'c', initials: 'PR' },
        ],
    },
    {
        id: '1',
        name: 'Les Faucheurs du Dimanche',
        visibility: 'PRIVATE',
        members: 8,
        rank: 2,
        points: 420,
        isLeader: false,
        topMembers: [
            { id: 'd', initials: 'MO' },
            { id: 'e', initials: 'LE' },
            { id: 'f', initials: 'GG' },
        ],
    },
];

const FEED: DeathFeedEntry[] = [
    {
        id: 'g',
        celebrityName: 'Dame Gloria Ravensworth',
        age: 96,
        scorers: 3,
        when: 'il y a 2 j',
        points: 140,
    },
    {
        id: 'b',
        celebrityName: 'Buck Thunderlane',
        age: 87,
        scorers: 1,
        when: 'il y a 5 j',
        points: 90,
    },
];

function Dashboard() {
    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="grid gap-4 md:gap-[18px] lg:grid-cols-[1.7fr_1fr]">
                {/* left column */}
                <div className="flex flex-col gap-4 md:gap-[18px]">
                    <ScoreBand
                        year={YEAR}
                        score={1630}
                        streak={3}
                        weekDelta={185}
                        circles={4}
                        deaths={9}
                        bestRank="#2"
                    />
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Vos cercles</h2>
                        <Link
                            to="/circles"
                            className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-line-2 bg-surface px-3 text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
                        >
                            <Plus size={14} /> Nouveau cercle
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {CIRCLES.map((circle) => (
                            <CircleCard key={circle.id} circle={circle} />
                        ))}
                    </div>
                </div>

                {/* right rail */}
                <div className="flex flex-col gap-4 md:gap-[18px]">
                    <BetProgressCard
                        year={YEAR}
                        selected={12}
                        total={15}
                        closesLabel="clôture 31 déc."
                    />
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Décès récents</h2>
                        <span className="text-xs text-ink-3">qui ont marqué</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {FEED.map((entry) => (
                            <DeathFeedItem key={entry.id} entry={entry} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
