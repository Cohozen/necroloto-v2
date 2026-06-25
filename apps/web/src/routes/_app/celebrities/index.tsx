import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, ChevronDown, Plus, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CelebrityCard } from '@/components/celebrities/CelebrityCard';
import { CelebrityFilters } from '@/components/celebrities/CelebrityFilters';
import { DraftTray } from '@/components/celebrities/DraftTray';
import { ProposeCelebrityDialog } from '@/components/celebrities/ProposeCelebrityDialog';
import { PageLoader } from '@/components/feedback/PageLoader';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { Button } from '@/components/ui/button';
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
    useCatalogueCelebrities,
    useCircleSummaries,
    useCreateBet,
    useReplaceBetCelebrities,
    useSeasonYear,
    useUserBets,
} from '@/lib/api/queries';
import type { ApiBet, CelebrityFilterValues, CircleSummaryDto } from '@/lib/api/types';

export const Route = createFileRoute('/_app/celebrities/')({
    component: Catalogue,
});

const TOTAL = MAX_BET_CELEBRITIES;

function Catalogue() {
    const { user } = useCurrentUser();
    const year = useSeasonYear();
    const betsQuery = useUserBets(user?.id);
    const summariesQuery = useCircleSummaries(user?.id, year);

    if (!user || betsQuery.isLoading || summariesQuery.isLoading) {
        return <PageLoader label="Chargement du draft…" />;
    }

    return (
        <DraftScreen
            userId={user.id}
            year={year}
            bets={betsQuery.data ?? []}
            circles={summariesQuery.data ?? []}
        />
    );
}

interface DraftScreenProps {
    userId: string;
    year: number;
    bets: ApiBet[];
    circles: CircleSummaryDto[];
}

function DraftScreen({ userId, year, bets, circles }: DraftScreenProps) {
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
    // Search runs server-side — debounce so each keystroke doesn't refetch.
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
        return () => clearTimeout(t);
    }, [query]);

    const [filters, setFilters] = useState<CelebrityFilterValues>({});
    const catalogueQuery = useCatalogueCelebrities({ search: debouncedQuery, filters });

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

    // The server paginates living-only picks, alphabetically, filtered by search.
    const cards = useMemo(
        () => (catalogueQuery.data?.pages.flatMap((p) => p.items) ?? []).map(toCelebritySummary),
        [catalogueQuery.data],
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

    // A freshly proposed celebrity is added straight to the selection (the
    // catalogue refetches in the background to surface its pending card).
    const addToSelection = (id: string) => {
        setSelected((prev) => {
            if (prev.has(id) || prev.size >= TOTAL) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    // Infinite scroll: load the next page when the sentinel scrolls into view.
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = catalogueQuery;
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const isSaving = createBet.isPending || replaceBet.isPending;
    const canSave = !!circleId && selected.size > 0 && !isSaving && !locked;

    const handleValidate = () => {
        if (!canSave || !circleId) return;
        const ids = [...selected];
        // Surface the API message verbatim — e.g. it names any already-deceased pick.
        const handlers = {
            onSuccess: () => toast.success('Votre liste a été enregistrée.'),
            onError: (err: Error) =>
                toast.error(err.message || "L'enregistrement de votre liste a échoué."),
        };
        if (bet) {
            replaceBet.mutate({ betId: bet.id, celebrities: ids }, handlers);
        } else {
            createBet.mutate({ userId, year, circleId, celebrityIds: ids }, handlers);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Draft · saison {year}
                    </span>
                    <h1 className="font-display text-3xl font-extrabold">Composez votre liste</h1>
                </div>
                {!locked && (
                    <ProposeCelebrityDialog onProposed={addToSelection}>
                        <Button>
                            <Plus size={17} strokeWidth={2.2} />{' '}
                            <span className="hidden md:inline">Ajouter</span>
                        </Button>
                    </ProposeCelebrityDialog>
                )}
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

            <div className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 focus-within:border-neon/60">
                <Search size={16} />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une célébrité…"
                    className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
                />
            </div>

            <CelebrityFilters
                filters={filters}
                onChange={setFilters}
                count={catalogueQuery.data?.pages[0]?.total}
            />

            {locked && (
                <p className="rounded-xl border border-line-2 bg-surface px-3.5 py-2.5 text-[13px] text-ink-2">
                    {lockMessage}
                </p>
            )}

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {cards.map((celebrity) => (
                    <CelebrityCard
                        key={celebrity.id}
                        celebrity={celebrity}
                        selected={selected.has(celebrity.id)}
                        onToggle={toggle}
                        disabled={locked}
                    />
                ))}
            </div>

            {catalogueQuery.isLoading && <SectionLoader label="Chargement des célébrités…" />}

            {!catalogueQuery.isLoading && cards.length === 0 && (
                <p className="py-10 text-center text-ink-3">Aucune célébrité ne correspond.</p>
            )}

            {/* infinite-scroll sentinel */}
            <div ref={sentinelRef} className="h-8" aria-hidden />
            {isFetchingNextPage && <SectionLoader inline label="Chargement…" />}

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
