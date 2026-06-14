import { createFileRoute } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { CircleHeader } from '@/components/circles/CircleHeader';
import { LeaderboardRow } from '@/components/circles/LeaderboardRow';
import { LeaderPicksCard } from '@/components/circles/LeaderPicksCard';
import { Podium } from '@/components/circles/Podium';
import { YearTabs } from '@/components/circles/YearTabs';
import { Button } from '@/components/ui/button';
import type { LeaderboardEntry, LeaderPick } from '@/types/leaderboard';

export const Route = createFileRoute('/_app/circles/$id')({
    component: CirclePage,
});

const CURRENT_YEAR = new Date().getFullYear();

// TEMP mock data — replaced by the API in the data step.
const LEADERBOARD: LeaderboardEntry[] = [
    {
        id: '1',
        name: 'Sasha Volkov',
        initials: 'SV',
        rank: 1,
        points: 615,
        hits: 4,
        streak: 1,
        bets: 12,
    },
    {
        id: '2',
        name: 'Vous',
        initials: 'ME',
        rank: 2,
        points: 420,
        hits: 3,
        streak: 3,
        bets: 12,
        isYou: true,
    },
    { id: '3', name: 'Priya', initials: 'PR', rank: 3, points: 360, hits: 3, streak: 2, bets: 10 },
    { id: '4', name: 'Mortimer', initials: 'MO', rank: 4, points: 300, hits: 2, bets: 9 },
    { id: '5', name: 'Léa', initials: 'LE', rank: 5, points: 280, hits: 2, streak: 1, bets: 11 },
    { id: '6', name: 'Babette', initials: 'BA', rank: 6, points: 210, hits: 1, bets: 8 },
    { id: '7', name: 'Glen', initials: 'GL', rank: 7, points: 180, hits: 1, bets: 7 },
    { id: '8', name: 'Tonton Gégé', initials: 'GG', rank: 8, points: 120, hits: 0, bets: 6 },
];

const LEADER_PICKS: LeaderPick[] = [
    {
        id: 'a',
        name: 'Dame Gloria Ravensworth',
        role: 'Aristocrate',
        status: 'deceased',
        points: 140,
    },
    { id: 'b', name: 'Buck Thunderlane', role: 'Acteur', status: 'alive' },
    { id: 'c', name: 'Strogov', role: 'Politicien', status: 'alive' },
    { id: 'd', name: 'Yolanda Vega', role: 'Chanteuse', status: 'alive' },
];

function CirclePage() {
    const [year, setYear] = useState(CURRENT_YEAR);
    const top3 = LEADERBOARD.slice(0, 3);
    const rest = LEADERBOARD.slice(3);
    const leader = LEADERBOARD[0];

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <CircleHeader name="Les Faucheurs du Dimanche" visibility="PRIVATE" members={8} />
                <div className="flex items-center gap-3">
                    <YearTabs
                        value={year}
                        onValueChange={setYear}
                        years={[CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR]}
                    />
                    <Button variant="outline" size="sm" className="hidden md:inline-flex">
                        <UserPlus size={15} /> Inviter
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
                <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5 md:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                                Podium · saison {year}
                            </span>
                            <span className="text-xs text-ink-3">8 joueurs · 31 mises</span>
                        </div>
                        <Podium top3={top3} />
                    </div>

                    <div className="flex flex-col gap-2">
                        {rest.map((entry) => (
                            <LeaderboardRow
                                key={entry.id}
                                entry={entry}
                                isLast={entry.rank === LEADERBOARD.length}
                            />
                        ))}
                    </div>
                </div>

                <div className="hidden lg:block">
                    <LeaderPicksCard
                        name={leader.name}
                        initials={leader.initials}
                        points={leader.points}
                        hits={leader.hits}
                        picks={LEADER_PICKS}
                    />
                </div>
            </div>
        </div>
    );
}
