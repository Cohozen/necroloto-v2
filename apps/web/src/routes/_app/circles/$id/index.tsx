import { createFileRoute } from '@tanstack/react-router';
import { Lock, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CircleBackLink } from '@/components/circles/CircleBackLink';
import { CircleHeader } from '@/components/circles/CircleHeader';
import { CircleTabs } from '@/components/circles/CircleTabs';
import { InviteDialog } from '@/components/circles/InviteDialog';
import { LeaderboardRow } from '@/components/circles/LeaderboardRow';
import { LeaderPicksCard } from '@/components/circles/LeaderPicksCard';
import { Podium } from '@/components/circles/Podium';
import { YearTabs } from '@/components/circles/YearTabs';
import { Button } from '@/components/ui/button';
import { isSeasonRevealed, toLeaderboardEntry, toLeaderPicks } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useCircleDetail, useCircleRank, useSeasons, useSeasonYearTabs } from '@/lib/api/queries';

export const Route = createFileRoute('/_app/circles/$id/')({
    component: CircleLeaderboard,
});

function CircleLeaderboard() {
    const { id } = Route.useParams();
    const { years, defaultYear } = useSeasonYearTabs();
    // null until the user picks a tab → falls back to the active season's year.
    const [picked, setPicked] = useState<number | null>(null);
    const year = picked ?? defaultYear;
    const [inviteOpen, setInviteOpen] = useState(false);
    const { user } = useCurrentUser();

    const circle = useCircleDetail(id);
    const rankQuery = useCircleRank(id, year);
    const seasons = useSeasons();
    // Picks stay secret until the season opens (the server already blanks them).
    const revealed = isSeasonRevealed(seasons.data?.find((s) => s.year === year));

    const leaderboard = useMemo(
        () => (rankQuery.data ?? []).map((bet) => toLeaderboardEntry(bet, user?.id)),
        [rankQuery.data, user?.id],
    );

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const leader = leaderboard[0];
    const leaderBet = rankQuery.data?.[0];
    const totalBets = leaderboard.reduce((acc, entry) => acc + entry.bets, 0);
    const members = circle.data?.memberships?.length ?? leaderboard.length;

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
                    <div className="flex items-center gap-3">
                        <YearTabs value={year} onValueChange={setPicked} years={years} />
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:inline-flex"
                            onClick={() => setInviteOpen(true)}
                        >
                            <UserPlus size={15} /> Inviter
                        </Button>
                    </div>
                </div>
                <CircleTabs id={id} active="leaderboard" />
            </div>

            <InviteDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                code={circle.data?.code ?? null}
            />

            {rankQuery.isLoading ? (
                <p className="text-[13px] text-ink-3">Chargement du classement…</p>
            ) : rankQuery.isError ? (
                <p className="text-[13px] text-coral">Impossible de charger le classement.</p>
            ) : leaderboard.length === 0 ? (
                <p className="text-[13px] text-ink-3">
                    Aucun pari pour la saison {year} dans ce cercle.
                </p>
            ) : (
                <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5 md:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                                    Podium · saison {year}
                                </span>
                                <span className="text-xs text-ink-3">
                                    {leaderboard.length} joueurs · {totalBets} mises
                                </span>
                            </div>
                            <Podium top3={top3} />
                        </div>

                        <div className="flex flex-col gap-2">
                            {rest.map((entry) => (
                                <LeaderboardRow
                                    key={entry.id}
                                    entry={entry}
                                    isLast={entry.rank === leaderboard.length}
                                />
                            ))}
                        </div>
                    </div>

                    {leader &&
                        leaderBet &&
                        (revealed || leaderBet.userId === user?.id ? (
                            <div className="hidden lg:block">
                                <LeaderPicksCard
                                    name={leader.name}
                                    initials={leader.initials}
                                    points={leader.points}
                                    hits={leader.hits}
                                    picks={toLeaderPicks(leaderBet)}
                                />
                            </div>
                        ) : (
                            <div className="hidden lg:block">
                                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-6 text-center">
                                    <Lock size={20} className="text-ink-3" />
                                    <p className="text-[13px] font-semibold text-ink-2">
                                        Paris secrets
                                    </p>
                                    <p className="text-xs text-ink-3">
                                        Les sélections seront visibles à l'ouverture de la saison.
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
