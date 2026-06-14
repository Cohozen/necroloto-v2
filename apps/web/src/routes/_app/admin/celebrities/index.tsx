import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { CelebrityTable } from '@/components/admin/CelebrityTable';
import type { AdminCelebrity, CatalogFilter } from '@/types/admin';

export const Route = createFileRoute('/_app/admin/celebrities/')({
    component: AdminCatalogue,
});

// TEMP mock data — replaced by the API (admin catalogue endpoints) in the data step.
const CELEBRITIES: AdminCelebrity[] = [
    {
        id: 'gloria',
        name: 'Dame Gloria Ravensworth',
        role: 'Aristocrate',
        born: 1929,
        status: 'deceased',
        points: 140,
        bettors: 3,
    },
    {
        id: 'buck',
        name: 'Buck Thunderlane',
        role: 'Cascadeur',
        born: 1938,
        status: 'deceased',
        points: 90,
        bettors: 1,
    },
    {
        id: 'yola',
        name: 'Yolanda Pristine',
        role: 'Diva de l’opéra',
        born: 1941,
        status: 'alive',
        points: 0,
        bettors: 7,
    },
    {
        id: 'strog',
        name: 'Maréchal Strogov',
        role: 'Ex-chef d’État',
        born: 1933,
        status: 'alive',
        points: 0,
        bettors: 5,
    },
    {
        id: 'babet',
        name: 'Babette Lenoir',
        role: 'Actrice',
        born: 1947,
        status: 'alive',
        points: 0,
        bettors: 9,
    },
    {
        id: 'glen',
        name: 'Glen Hawksworth',
        role: 'Magnat de la presse',
        born: 1936,
        status: 'deceased',
        points: 110,
        bettors: 2,
    },
    {
        id: 'mira',
        name: 'Mira Castellane',
        role: 'Chanteuse',
        born: 1952,
        status: 'alive',
        points: 0,
        bettors: 4,
    },
    {
        id: 'odil',
        name: 'Odilon Vance',
        role: 'Réalisateur',
        born: 1944,
        status: 'alive',
        points: 0,
        bettors: 6,
    },
    {
        id: 'sera',
        name: 'Sera Bellweather',
        role: 'Astronaute',
        born: 1939,
        status: 'alive',
        points: 0,
        bettors: 2,
    },
];

function AdminCatalogue() {
    const [filter, setFilter] = useState<CatalogFilter>('all');

    const rows = useMemo(
        () =>
            filter === 'all' ? CELEBRITIES : CELEBRITIES.filter((celeb) => celeb.status === filter),
        [filter],
    );
    const deaths = CELEBRITIES.filter((celeb) => celeb.status === 'deceased').length;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Admin" />
            <CatalogToolbar
                filter={filter}
                onFilterChange={setFilter}
                total={CELEBRITIES.length}
                deaths={deaths}
            />
            <CelebrityTable celebrities={rows} />
        </div>
    );
}
