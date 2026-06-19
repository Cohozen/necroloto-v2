import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, ChevronDown, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CelebrityCard } from '@/components/celebrities/CelebrityCard';
import { DraftTray } from '@/components/celebrities/DraftTray';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toCelebritySummary } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import {
    MAX_BET_CELEBRITIES,
    useCelebrities,
    useCircleSummaries,
    useCreateBet,
    useReplaceBetCelebrities,
    useSeasonYear,
    useUserBets,
} from '@/lib/api/queries';
import type { ApiBet, ApiCelebrity, CircleSummaryDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/celebrities/')({
    component: Catalogue,
});

const TOTAL = MAX_BET_CELEBRITIES;
const CATEGORIES = ['Tous', 'Cinéma', 'Musique', 'Royauté & politique', 'Sport', 'Affaires'];

function Catalogue() {
    const { user } = useCurrentUser();
    const year = useSeasonYear();
    const celebsQuery = useCelebrities();
    const betsQuery = useUserBets(user?.id);
    const summariesQuery = useCircleSummaries(user?.id, year);

    if (!user || celebsQuery.isLoading || betsQuery.isLoading || summariesQuery.isLoading) {
        return <p className="p-6 text-sm text-ink-3">Chargement du draft…</p>;
    }

    return (
        <DraftScreen
            userId={user.id}
            year={year}
            celebrities={celebsQuery.data ?? []}
            bets={betsQuery.data ?? []}
            circles={summariesQuery.data ?? []}
        />
    );
}

interface DraftScreenProps {
    userId: string;
    year: number;
    celebrities: ApiCelebrity[];
    bets: ApiBet[];
    circles: CircleSummaryDto[];
}

function DraftScreen({ userId, year, celebrities, bets, circles }: DraftScreenProps) {
    const createBet = useCreateBet();
    const replaceBet = useReplaceBetCelebrities();

    const yearBets = useMemo(() => bets.filter((b) => b.year === year), [bets, year]);

    const [circleId, setCircleId] = useState<string | undefined>(
        () => yearBets[0]?.circleId ?? circles[0]?.id,
    );

    const bet = useMemo(
        () => yearBets.find((b) => (b.circleId ?? undefined) === circleId),
        [yearBets, circleId],
    );

    const [selected, setSelected] = useState<Set<string>>(
        () => new Set(bet?.CelebritiesOnBet.map((c) => c.celebrityId)),
    );

    // Re-seed the selection from the bet of the newly-selected circle.
    useEffect(() => {
        const next = yearBets.find((b) => (b.circleId ?? undefined) === circleId);
        setSelected(new Set(next?.CelebritiesOnBet.map((c) => c.celebrityId)));
    }, [circleId, yearBets]);

    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Tous');

    const selectedCircle = circles.find((c) => c.id === circleId);
    // Lock follows the season phase: during the betting window everyone edits
    // freely; once the season is open it needs the circle "rallonge" flag
    // (allowEdit to finish an existing bet, allowNewBet to start one); before /
    // after the season it is locked. No season → the flag is the only gate (V1).
    const phase = selectedCircle?.seasonPhase;
    const flagOpen = bet ? selectedCircle?.allowEdit : selectedCircle?.allowNewBet;
    const { locked, lockMessage } = useMemo(() => {
        if (!selectedCircle) return { locked: false, lockMessage: '' };
        switch (phase) {
            case 'betting':
                return { locked: false, lockMessage: '' };
            case 'before':
                return {
                    locked: true,
                    lockMessage: '🔒 Les paris ne sont pas encore ouverts pour cette saison.',
                };
            case 'closed':
                return { locked: true, lockMessage: '🔒 Les paris sont fermés pour cette saison.' };
            default: // 'season-open' | 'none'
                if (flagOpen) return { locked: false, lockMessage: '' };
                return {
                    locked: true,
                    lockMessage: bet
                        ? "🔒 La liste n'est plus modifiable pour ce cercle."
                        : '🔒 Les nouveaux paris sont fermés pour ce cercle.',
                };
        }
    }, [selectedCircle, phase, flagOpen, bet]);

    // Deceased celebrities are no longer draftable — only living ones are shown.
    const cards = useMemo(
        () => celebrities.map(toCelebritySummary).filter((c) => c.status !== 'deceased'),
        [celebrities],
    );

    const toggle = (id: string) => {
        if (locked) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < TOTAL) next.add(id);
            return next;
        });
    };

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return cards.filter(
            (c) =>
                (category === 'Tous' || c.category === category) &&
                (q === '' || c.name.toLowerCase().includes(q)),
        );
    }, [cards, query, category]);

    const isSaving = createBet.isPending || replaceBet.isPending;
    const canSave = !!circleId && selected.size > 0 && !isSaving && !locked;

    const handleValidate = () => {
        if (!canSave || !circleId) return;
        const ids = [...selected];
        if (bet) {
            replaceBet.mutate({ betId: bet.id, celebrities: ids });
        } else {
            createBet.mutate({ userId, year, circleId, celebrityIds: ids });
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Draft · saison {year}
                    </span>
                    <h1 className="font-display text-3xl font-extrabold">Composez votre liste</h1>
                </div>
                <span className="inline-flex h-[34px] items-center rounded-full border border-neon/40 bg-neon/10 px-3 text-[13px] font-semibold text-neon">
                    {selected.size} / {TOTAL} sélectionnées
                </span>
            </div>

            {/* circle selector — the bet is saved against the chosen circle */}
            {circles.length === 0 ? (
                <p className="text-[13px] text-ink-3">
                    Rejoignez ou créez un cercle pour enregistrer un pari.{' '}
                    <Link to="/circles" className="font-semibold text-neon">
                        Mes cercles
                    </Link>
                </p>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-line-2 bg-surface px-3.5 text-[14px] font-semibold text-ink-2 hover:text-ink"
                        >
                            <Users size={16} className="text-ink-3" />
                            {selectedCircle?.name ?? 'Choisir un cercle'}
                            <ChevronDown size={15} className="text-ink-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                        {circles.map((c) => (
                            <DropdownMenuItem key={c.id} onSelect={() => setCircleId(c.id)}>
                                <Users size={15} /> {c.name}
                                {c.id === circleId && <Check size={15} className="ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une célébrité…"
                    className="h-11 pl-10"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                            'inline-flex h-8 items-center rounded-[9px] border px-3 text-[13px] font-semibold transition-colors',
                            cat === category
                                ? 'border-neon/50 bg-neon/8 text-neon'
                                : 'border-line-2 bg-surface text-ink-2 hover:text-ink',
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {locked && (
                <p className="rounded-xl border border-line-2 bg-surface px-3.5 py-2.5 text-[13px] text-ink-2">
                    {lockMessage}
                </p>
            )}

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.map((celebrity) => (
                    <CelebrityCard
                        key={celebrity.id}
                        celebrity={celebrity}
                        selected={selected.has(celebrity.id)}
                        onToggle={toggle}
                        disabled={locked}
                    />
                ))}
            </div>

            {results.length === 0 && (
                <p className="py-10 text-center text-ink-3">Aucune célébrité ne correspond.</p>
            )}

            {(createBet.isError || replaceBet.isError) && (
                <p className="text-[13px] text-coral">
                    L'enregistrement du pari a échoué. Réessayez.
                </p>
            )}

            <DraftTray
                selected={selected.size}
                total={TOTAL}
                onValidate={handleValidate}
                saving={isSaving}
                disabled={!canSave}
            />
        </div>
    );
}
