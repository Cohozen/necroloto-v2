import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { CelebrityTable } from '@/components/admin/CelebrityTable';
import { toAdminCelebrity } from '@/lib/api/adapters';
import {
    useAdminCelebrities,
    useBulkDeleteCelebrities,
    useBulkEnrichCelebrities,
} from '@/lib/api/queries';
import type { CatalogFilter } from '@/types/admin';

export const Route = createFileRoute('/_app/admin/celebrities/')({
    component: AdminCatalogue,
});

function AdminCatalogue() {
    const [filter, setFilter] = useState<CatalogFilter>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(() => new Set());

    // Debounce the search box so each keystroke doesn't fire a request.
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useAdminCelebrities({ search: debouncedSearch, status: filter });

    const bulkDelete = useBulkDeleteCelebrities();
    const bulkEnrich = useBulkEnrichCelebrities();

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

    const handleSync = () => {
        const ids = [...selected];
        bulkEnrich.mutate(ids, {
            onSuccess: (res) => {
                const ok = res.results.filter((r) => r.success).length;
                const failed = res.results.length - ok;
                if (failed === 0)
                    toast.success(
                        `${ok} fiche${ok > 1 ? 's' : ''} synchronisée${ok > 1 ? 's' : ''}.`,
                    );
                else toast.warning(`${ok} synchronisée(s), ${failed} en échec.`);
                clearSelection();
            },
            onError: () => toast.error('La synchronisation a échoué.'),
        });
    };

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
            {isLoading ? (
                <p className="py-12 text-center text-sm text-ink-3">Chargement du catalogue…</p>
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
                    />
                    <div ref={sentinelRef} className="h-8" aria-hidden />
                    {isFetchingNextPage && (
                        <p className="py-2 text-center text-sm text-ink-3">Chargement…</p>
                    )}
                </>
            )}

            {selected.size > 0 && (
                <BulkActionBar
                    count={selected.size}
                    onClear={clearSelection}
                    onDelete={handleDelete}
                    onSync={handleSync}
                    isDeleting={bulkDelete.isPending}
                    isSyncing={bulkEnrich.isPending}
                />
            )}
        </div>
    );
}
