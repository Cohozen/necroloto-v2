import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
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

// Selected year lives in the circle layout's URL search (shared across tabs).
const circleRoute = getRouteApi('/_app/circles/$id');

/** "Paris" tab — every member's bet for the selected season (secret until open). */
function CircleBets() {
    const { id } = Route.useParams();
    const { years, defaultYear } = useSeasonYearTabs();
    const navigate = circleRoute.useNavigate();
    // Undefined until the user picks a year → falls back to the active season's year.
    const { year: picked } = circleRoute.useSearch();
    const year = picked ?? defaultYear;
    const setYear = (next: number) =>
        navigate({ search: (prev) => ({ ...prev, year: next }), replace: true });
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
                    <YearTabs
                        value={year}
                        onValueChange={setYear}
                        years={years}
                        className="hidden md:inline-flex"
                    />
                </div>
                <CircleTabs id={id} active="bets" />
                <div className="flex md:hidden items-center gap-3">
                    <YearTabs value={year} onValueChange={setYear} years={years} />
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
                // Masonry (CSS columns) so expanding one card grows only its own
                // column instead of stretching its row neighbours (rigid grid).
                <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                    {bets.map((bet) => {
                        const isYou = bet.userId === user?.id;
                        const name = isYou ? 'Vous' : userDisplayName(bet.user);
                        const points = bet.CelebritiesOnBet.reduce((acc, c) => acc + c.points, 0);
                        const hits = bet.CelebritiesOnBet.filter((c) => !!c.celebrity.death).length;
                        return (
                            <div key={bet.id} className="mb-4 break-inside-avoid">
                                <LeaderPicksCard
                                    name={name}
                                    initials={isYou ? 'ME' : initialsOf(name)}
                                    points={points}
                                    hits={hits}
                                    picks={toLeaderPicks(bet)}
                                    collapsible
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
