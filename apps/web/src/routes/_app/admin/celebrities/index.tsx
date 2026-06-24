import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { CelebrityTable } from '@/components/admin/CelebrityTable';
import { CelebrityTableSkeleton } from '@/components/admin/CelebrityTableSkeleton';
import { MergeCelebrityDialog } from '@/components/admin/MergeCelebrityDialog';
import { CelebrityFilters } from '@/components/celebrities/CelebrityFilters';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { toAdminCelebrity } from '@/lib/api/adapters';
import {
    useAdminCelebrities,
    useApproveCelebrity,
    useBulkDeleteCelebrities,
    useBulkEnrichCelebrities,
    useRejectCelebrity,
    useSyncJob,
} from '@/lib/api/queries';
import type { AdminCelebrityStatus, CelebrityFilterValues } from '@/lib/api/types';
import { AGE_BUCKETS, GENDER_OPTIONS } from '@/lib/celebrities/facets';
import type { AdminCelebrity, CatalogFilter } from '@/types/admin';

const CATALOG_FILTERS: CatalogFilter[] = ['all', 'alive', 'deceased', 'pending', 'unlinked'];

interface CatalogueSearch extends CelebrityFilterValues {
    filter?: CatalogFilter;
    q?: string;
}

/**
 * Catalogue filters live in the URL so they survive back-navigation/refresh. Every
 * param is optional (omitted at its default) so links to this route need no search.
 */
export const Route = createFileRoute('/_app/admin/celebrities/')({
    validateSearch: (search: Record<string, unknown>): CatalogueSearch => {
        const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
        const filter = CATALOG_FILTERS.includes(search.filter as CatalogFilter)
            ? (search.filter as CatalogFilter)
            : undefined;
        const q = str(search.q);
        const category = str(search.category);
        const nationality = str(search.nationality);
        const gender = GENDER_OPTIONS.includes(search.gender as (typeof GENDER_OPTIONS)[number])
            ? (search.gender as string)
            : undefined;
        const age = AGE_BUCKETS.some((b) => b.id === search.age)
            ? (search.age as string)
            : undefined;
        return {
            ...(filter && filter !== 'all' ? { filter } : {}),
            ...(q ? { q } : {}),
            ...(category ? { category } : {}),
            ...(nationality ? { nationality } : {}),
            ...(gender ? { gender } : {}),
            ...(age ? { age } : {}),
        };
    },
    component: AdminCatalogue,
});

function AdminCatalogue() {
    const navigate = Route.useNavigate();
    const { filter = 'all', q = '', category, nationality, gender, age } = Route.useSearch();
    const facetFilters: CelebrityFilterValues = { category, nationality, gender, age };
    // Local mirror of the URL query so typing stays instant; debounced back to the URL.
    const [search, setSearch] = useState(q);
    const [selected, setSelected] = useState<Set<string>>(() => new Set());

    const setFilter = useCallback(
        (next: CatalogFilter) =>
            navigate({ search: (prev) => ({ ...prev, filter: next }), replace: true }),
        [navigate],
    );

    const setFacetFilters = useCallback(
        (next: CelebrityFilterValues) =>
            navigate({
                search: (prev) => ({
                    ...prev,
                    category: next.category,
                    nationality: next.nationality,
                    gender: next.gender,
                    age: next.age,
                }),
                replace: true,
            }),
        [navigate],
    );

    // Debounce the search box back into the URL so each keystroke doesn't fire a request.
    useEffect(() => {
        const id = setTimeout(() => {
            if (search !== q)
                navigate({ search: (prev) => ({ ...prev, q: search }), replace: true });
        }, 300);
        return () => clearTimeout(id);
    }, [search, q, navigate]);

    // Re-sync the input when the URL query changes from the outside (back/forward).
    useEffect(() => setSearch(q), [q]);

    // "unlinked" is a Wikidata-link axis, not a status — map it to that param so it
    // matches every status (alive/deceased/pending) with no wikidataId.
    let status: AdminCelebrityStatus = 'all';
    let wikidata: 'unlinked' | undefined;
    if (filter === 'unlinked') {
        wikidata = 'unlinked';
    } else {
        status = filter;
    }
    const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useAdminCelebrities({ search: q, status, wikidata, filters: facetFilters });

    const qc = useQueryClient();
    const bulkDelete = useBulkDeleteCelebrities();
    const bulkEnrich = useBulkEnrichCelebrities();
    const approve = useApproveCelebrity();
    const reject = useRejectCelebrity();

    // The pending proposal being merged into a target (null closes the dialog).
    const [mergeSource, setMergeSource] = useState<AdminCelebrity | null>(null);

    // Async enrich: enqueue a job, then poll it for progress until terminal.
    const [syncJobId, setSyncJobId] = useState<string | null>(null);
    const syncJob = useSyncJob(syncJobId);

    const rows = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page.items).map(toAdminCelebrity),
        [data],
    );
    const total = data?.pages[0]?.total ?? 0;

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        setSelected((prev) => {
            const allSelected = rows.length > 0 && rows.every((r) => prev.has(r.id));
            return allSelected ? new Set() : new Set(rows.map((r) => r.id));
        });
    }, [rows]);

    const clearSelection = useCallback(() => setSelected(new Set()), []);

    const handleDelete = () => {
        const ids = [...selected];
        bulkDelete.mutate(ids, {
            onSuccess: (res) => {
                toast.success(
                    `${res.deleted} célébrité${res.deleted > 1 ? 's' : ''} supprimée${res.deleted > 1 ? 's' : ''}.`,
                );
                clearSelection();
            },
            onError: () => toast.error('La suppression a échoué.'),
        });
    };

    const handleApprove = (id: string, wikidataId?: string) => {
        approve.mutate(
            { id, wikidataId },
            {
                onSuccess: () => toast.success('Célébrité validée.'),
                onError: () => toast.error('La validation a échoué.'),
            },
        );
    };

    const handleReject = (id: string) => {
        reject.mutate(id, {
            onSuccess: () => toast.success('Proposition rejetée.'),
            onError: () => toast.error('Le rejet a échoué.'),
        });
    };

    // Disable the row whose approve/reject is in flight.
    const busyId =
        approve.isPending && approve.variables
            ? approve.variables.id
            : reject.isPending && typeof reject.variables === 'string'
              ? reject.variables
              : null;

    const handleSync = () => {
        const ids = [...selected];
        bulkEnrich.mutate(ids, {
            // Keep the selection (and the bar) until the job finishes, so its
            // progress stays visible; cleared in the terminal effect below.
            onSuccess: (job) => setSyncJobId(job.id),
            onError: () => toast.error("La synchronisation n'a pas pu démarrer."),
        });
    };

    // Surface the result once the polled job finishes, then stop polling.
    useEffect(() => {
        const job = syncJob.data;
        if (!syncJobId || !job) return;
        if (job.status !== 'SUCCEEDED' && job.status !== 'FAILED') return;

        if (job.status === 'FAILED') {
            toast.error('La synchronisation a échoué.');
        } else if (job.failed === 0) {
            toast.success(
                `${job.succeeded} fiche${job.succeeded > 1 ? 's' : ''} synchronisée${job.succeeded > 1 ? 's' : ''}.`,
            );
        } else {
            toast.warning(`${job.succeeded} synchronisée(s), ${job.failed} en échec.`);
        }
        qc.invalidateQueries({ queryKey: ['celebrities'] });
        setSyncJobId(null);
    }, [syncJob.data, syncJobId, qc]);

    const syncing = bulkEnrich.isPending || syncJobId !== null;

    // Infinite scroll: load the next page when the sentinel enters the viewport.
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

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Admin" />
            <CatalogToolbar
                search={search}
                onSearchChange={setSearch}
                filter={filter}
                onFilterChange={setFilter}
                total={total}
            />
            <CelebrityFilters filters={facetFilters} onChange={setFacetFilters} />
            {isLoading ? (
                <CelebrityTableSkeleton />
            ) : isError ? (
                <p className="py-12 text-center text-sm text-coral">
                    Le catalogue n'a pas pu être chargé. Réessayez plus tard.
                </p>
            ) : rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-3">
                    Aucune célébrité ne correspond à cette recherche.
                </p>
            ) : (
                <>
                    <CelebrityTable
                        celebrities={rows}
                        selectedIds={selected}
                        onToggle={toggle}
                        onToggleAll={toggleAll}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onMerge={setMergeSource}
                        busyId={busyId}
                    />
                    <div ref={sentinelRef} className="h-8" aria-hidden />
                    {isFetchingNextPage && <SectionLoader inline label="Chargement…" />}
                </>
            )}

            {selected.size > 0 && (
                <BulkActionBar
                    count={selected.size}
                    onClear={clearSelection}
                    onDelete={handleDelete}
                    onSync={handleSync}
                    isDeleting={bulkDelete.isPending}
                    isSyncing={syncing}
                    syncProgress={
                        syncJob.data
                            ? {
                                  processed: syncJob.data.processed,
                                  total: syncJob.data.total,
                              }
                            : undefined
                    }
                />
            )}

            <MergeCelebrityDialog source={mergeSource} onClose={() => setMergeSource(null)} />
        </div>
    );
}
