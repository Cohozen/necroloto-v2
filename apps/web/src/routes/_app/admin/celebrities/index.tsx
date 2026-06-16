import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { CelebrityTable } from '@/components/admin/CelebrityTable';
import { toAdminCelebrity } from '@/lib/api/adapters';
import { useCelebrities } from '@/lib/api/queries';
import type { CatalogFilter } from '@/types/admin';

export const Route = createFileRoute('/_app/admin/celebrities/')({
    component: AdminCatalogue,
});

function AdminCatalogue() {
    const [filter, setFilter] = useState<CatalogFilter>('all');
    const { data, isLoading, isError } = useCelebrities();

    const celebrities = useMemo(() => (data ?? []).map(toAdminCelebrity), [data]);
    const rows = useMemo(
        () =>
            filter === 'all' ? celebrities : celebrities.filter((celeb) => celeb.status === filter),
        [celebrities, filter],
    );
    const deaths = celebrities.filter((celeb) => celeb.status === 'deceased').length;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Admin" />
            <CatalogToolbar
                filter={filter}
                onFilterChange={setFilter}
                total={celebrities.length}
                deaths={deaths}
            />
            {isLoading ? (
                <p className="py-12 text-center text-sm text-ink-3">Chargement du catalogue…</p>
            ) : isError ? (
                <p className="py-12 text-center text-sm text-coral">
                    Le catalogue n'a pas pu être chargé. Réessayez plus tard.
                </p>
            ) : (
                <CelebrityTable celebrities={rows} />
            )}
        </div>
    );
}
