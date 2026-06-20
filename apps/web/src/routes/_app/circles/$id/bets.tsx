import { createFileRoute } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { CircleBackLink } from '@/components/circles/CircleBackLink';
import { CircleHeader } from '@/components/circles/CircleHeader';
import { CircleTabs } from '@/components/circles/CircleTabs';
import { LeaderPicksCard } from '@/components/circles/LeaderPicksCard';
import { YearTabs } from '@/components/circles/YearTabs';
import { initialsOf, isSeasonRevealed, toLeaderPicks, userDisplayName } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useCircleBets, useCircleDetail, useSeasons, useSeasonYearTabs } from '@/lib/api/queries';

export const Route = createFileRoute('/_app/circles/$id/bets')({
    component: CircleBets,
});

/** "Paris" tab — every member's bet for the selected season (secret until open). */
function CircleBets() {
    const { id } = Route.useParams();
    const { years, defaultYear } = useSeasonYearTabs();
    // null until the user picks a tab → falls back to the active season's year.
    const [picked, setPicked] = useState<number | null>(null);
    const year = picked ?? defaultYear;
    const { user } = useCurrentUser();

    const circle = useCircleDetail(id);
    const betsQuery = useCircleBets(id, year);
    const seasons = useSeasons();
    const season = seasons.data?.find((s) => s.year === year);
    // The server only returns others' bets once revealed AND betsVisible; mirror
    // that here to explain why the list may be limited to the viewer's own bet.
    const revealed = isSeasonRevealed(season);
    const fullyVisible = revealed && (circle.data?.betsVisible ?? false);

    const members = circle.data?.memberships?.length ?? 0;
    const bets = betsQuery.data ?? [];

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <CircleBackLink />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CircleHeader
                        name={circle.data?.name ?? 'Cercle'}
                        visibility={circle.data?.visibility ?? 'PRIVATE'}
                        members={members}
                    />
                    <YearTabs value={year} onValueChange={setPicked} years={years} className='hidden md:inline-flex' />
                </div>
                <CircleTabs id={id} active="bets" />
                <div className="flex md:hidden items-center gap-3">
                    <YearTabs value={year} onValueChange={setPicked} years={years} />
                </div>
            </div>

            {!fullyVisible && (
                <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-4">
                    <Lock size={16} className="mt-0.5 shrink-0 text-ink-3" />
                    <p className="text-[13px] text-ink-2">
                        {!revealed
                            ? "Les paris sont secrets jusqu'à l'ouverture de la saison. Vous ne voyez que le vôtre pour l'instant."
                            : 'Les mises ne sont pas visibles dans ce cercle. Vous ne voyez que le vôtre.'}
                    </p>
                </div>
            )}

            {betsQuery.isLoading ? (
                <p className="text-[13px] text-ink-3">Chargement des paris…</p>
            ) : betsQuery.isError ? (
                <p className="text-[13px] text-coral">Impossible de charger les paris.</p>
            ) : bets.length === 0 ? (
                <p className="text-[13px] text-ink-3">
                    Aucun pari pour la saison {year} dans ce cercle.
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bets.map((bet) => {
                        const isYou = bet.userId === user?.id;
                        const name = isYou ? 'Vous' : userDisplayName(bet.user);
                        const points = bet.CelebritiesOnBet.reduce((acc, c) => acc + c.points, 0);
                        const hits = bet.CelebritiesOnBet.filter((c) => !!c.celebrity.death).length;
                        return (
                            <LeaderPicksCard
                                key={bet.id}
                                name={name}
                                initials={isYou ? 'ME' : initialsOf(name)}
                                points={points}
                                hits={hits}
                                picks={toLeaderPicks(bet)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
