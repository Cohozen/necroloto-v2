import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { CircleCard } from '@/components/circles/CircleCard';
import { BetProgressCard } from '@/components/dashboard/BetProgressCard';
import { DeathFeedItem } from '@/components/dashboard/DeathFeedItem';
import { ScoreBand } from '@/components/dashboard/ScoreBand';
import { toCircleSummary, toDeathFeedEntry } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import {
    MAX_BET_CELEBRITIES,
    useCircleSummaries,
    useDeathFeed,
    useSeasonYear,
    useUserBets,
} from '@/lib/api/queries';

export const Route = createFileRoute('/_app/dashboard')({
    component: Dashboard,
});

function Dashboard() {
    const { user } = useCurrentUser();
    const year = useSeasonYear();
    const summariesQuery = useCircleSummaries(user?.id, year);
    const betsQuery = useUserBets(user?.id);
    const feedQuery = useDeathFeed();

    const circles = useMemo(
        () => (summariesQuery.data ?? []).map(toCircleSummary),
        [summariesQuery.data],
    );
    const feed = useMemo(() => (feedQuery.data ?? []).map(toDeathFeedEntry), [feedQuery.data]);

    // Score band is composed client-side from the user's bets for the year.
    const stats = useMemo(() => {
        const yearBets = (betsQuery.data ?? []).filter((bet) => bet.year === year);
        const score = yearBets.reduce(
            (acc, bet) => acc + bet.CelebritiesOnBet.reduce((s, c) => s + c.points, 0),
            0,
        );
        const deaths = yearBets.reduce(
            (acc, bet) => acc + bet.CelebritiesOnBet.filter((c) => c.points > 0).length,
            0,
        );
        const ranks = circles.map((c) => c.rank).filter((r) => r > 0);
        const bestRank = ranks.length ? `#${Math.min(...ranks)}` : '—';
        return { score, deaths, bestRank };
    }, [betsQuery.data, circles, year]);

    // "Pari en cours" card: celebrities drafted in this year's bet for the first
    // circle (matches the draft's default circle selection).
    const currentBet = useMemo(() => {
        const yearBets = (betsQuery.data ?? []).filter((bet) => bet.year === year);
        const firstCircleId = circles[0]?.id;
        const bet = yearBets.find((b) => b.circleId === firstCircleId) ?? yearBets[0];
        return {
            selectedCount: bet?.CelebritiesOnBet.length ?? 0,
            circleName: bet?.Circle?.name,
        };
    }, [betsQuery.data, circles, year]);

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="grid gap-4 md:gap-[18px] lg:grid-cols-[1.7fr_1fr]">
                {/* left column */}
                <div className="flex flex-col gap-4 md:gap-[18px]">
                    <ScoreBand
                        year={year}
                        score={stats.score}
                        streak={0}
                        weekDelta={0}
                        circles={circles.length}
                        deaths={stats.deaths}
                        bestRank={stats.bestRank}
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
                    {summariesQuery.isLoading ? (
                        <p className="text-[13px] text-ink-3">Chargement de vos cercles…</p>
                    ) : circles.length === 0 ? (
                        <p className="text-[13px] text-ink-3">
                            Vous n'avez pas encore de cercle.{' '}
                            <Link to="/circles/new" className="font-semibold text-neon">
                                Créez-en un
                            </Link>
                            .
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {circles.map((circle) => (
                                <CircleCard key={circle.id} circle={circle} />
                            ))}
                        </div>
                    )}
                </div>

                {/* right rail */}
                <div className="flex flex-col gap-4 md:gap-[18px]">
                    <BetProgressCard
                        year={year}
                        selected={currentBet.selectedCount}
                        total={MAX_BET_CELEBRITIES}
                        closesLabel="clôture 31 déc."
                        circleName={currentBet.circleName}
                    />
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Décès récents</h2>
                        <span className="text-xs text-ink-3">qui ont marqué</span>
                    </div>
                    {feedQuery.isLoading ? (
                        <p className="text-[13px] text-ink-3">Chargement…</p>
                    ) : feed.length === 0 ? (
                        <p className="text-[13px] text-ink-3">Aucun décès cette saison.</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {feed.map((entry) => (
                                <DeathFeedItem key={entry.id} entry={entry} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
