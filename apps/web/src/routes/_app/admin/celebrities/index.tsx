import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { CelebrityTable } from '@/components/admin/CelebrityTable';
import { toAdminCelebrity } from '@/lib/api/adapters';
import { useAdminCelebrities } from '@/lib/api/queries';
import type { CatalogFilter } from '@/types/admin';

export const Route = createFileRoute('/_app/admin/celebrities/')({
    component: AdminCatalogue,
});

function AdminCatalogue() {
    const [filter, setFilter] = useState<CatalogFilter>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce the search box so each keystroke doesn't fire a request.
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useAdminCelebrities({ search: debouncedSearch, status: filter });

    const rows = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page.items).map(toAdminCelebrity),
        [data],
    );
    const total = data?.pages[0]?.total ?? 0;

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
                    <CelebrityTable celebrities={rows} />
                    <div ref={sentinelRef} className="h-8" aria-hidden />
                    {isFetchingNextPage && (
                        <p className="py-2 text-center text-sm text-ink-3">Chargement…</p>
                    )}
                </>
            )}
        </div>
    );
}
