import { createFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CelebrityCard } from '@/components/celebrities/CelebrityCard';
import { DraftTray } from '@/components/celebrities/DraftTray';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CelebritySummary } from '@/types/celebrity';

export const Route = createFileRoute('/_app/celebrities/')({
    component: Catalogue,
});

const YEAR = new Date().getFullYear();
const TOTAL = 15;
const CATEGORIES = ['Tous', 'Cinéma', 'Musique', 'Royauté & politique', 'Sport', 'Affaires'];

// TEMP mock data — replaced by the API (search) in the data step.
const CELEBRITIES: CelebritySummary[] = [
    {
        id: 'gloria',
        name: 'Dame Gloria Ravensworth',
        age: 96,
        born: 1929,
        role: 'Aristocrate',
        status: 'deceased',
        odds: 4.2,
        category: 'Royauté & politique',
    },
    {
        id: 'buck',
        name: 'Buck Thunderlane',
        age: 87,
        born: 1938,
        role: 'Acteur',
        status: 'alive',
        odds: 6.5,
        category: 'Cinéma',
    },
    {
        id: 'strog',
        name: 'Ivan Strogov',
        age: 81,
        born: 1944,
        role: 'Politicien',
        status: 'alive',
        odds: 5.1,
        category: 'Royauté & politique',
    },
    {
        id: 'babet',
        name: 'Babette Trompette',
        age: 92,
        born: 1933,
        role: 'Chanteuse',
        status: 'deceased',
        odds: 3.8,
        category: 'Musique',
    },
    {
        id: 'yola',
        name: 'Yolanda Vega',
        age: 78,
        born: 1947,
        role: 'Chanteuse',
        status: 'alive',
        odds: 7.2,
        category: 'Musique',
    },
    {
        id: 'glen',
        name: 'Glen Mort',
        age: 84,
        born: 1941,
        role: 'Réalisateur',
        status: 'alive',
        odds: 5.9,
        category: 'Cinéma',
    },
    {
        id: 'vane',
        name: 'Vanessa Crowe',
        age: 90,
        born: 1935,
        role: 'Actrice',
        status: 'alive',
        odds: 4.6,
        category: 'Cinéma',
    },
    {
        id: 'sven',
        name: 'Sven Karlsson',
        age: 88,
        born: 1937,
        role: 'Magnat',
        status: 'alive',
        odds: 6.1,
        category: 'Affaires',
    },
    {
        id: 'cons',
        name: 'Constance Hale',
        age: 95,
        born: 1930,
        role: 'Écrivaine',
        status: 'alive',
        odds: 4.0,
        category: 'Affaires',
    },
    {
        id: 'reggie',
        name: 'Reggie Frost',
        age: 79,
        born: 1946,
        role: 'Footballeur',
        status: 'alive',
        odds: 8.3,
        category: 'Sport',
    },
    {
        id: 'marlon',
        name: 'Marlon Pike',
        age: 83,
        born: 1942,
        role: 'Boxeur',
        status: 'alive',
        odds: 6.8,
        category: 'Sport',
    },
    {
        id: 'dot',
        name: 'Dot Sterling',
        age: 91,
        born: 1934,
        role: 'Actrice',
        status: 'alive',
        odds: 4.9,
        category: 'Cinéma',
    },
];

const INITIAL_SELECTION = ['gloria', 'strog', 'babet', 'yola', 'glen', 'vane', 'cons'];

function Catalogue() {
    const [selected, setSelected] = useState(() => new Set(INITIAL_SELECTION));
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Tous');

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return CELEBRITIES.filter(
            (c) =>
                (category === 'Tous' || c.category === category) &&
                (q === '' || c.name.toLowerCase().includes(q)),
        );
    }, [query, category]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Draft · saison {YEAR}
                    </span>
                    <h1 className="font-display text-3xl font-extrabold">Composez votre liste</h1>
                </div>
                <span className="inline-flex h-[34px] items-center rounded-full border border-neon/40 bg-neon/10 px-3 text-[13px] font-semibold text-neon">
                    {selected.size} / {TOTAL} sélectionnées
                </span>
            </div>

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

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.map((celebrity) => (
                    <CelebrityCard
                        key={celebrity.id}
                        celebrity={celebrity}
                        selected={selected.has(celebrity.id)}
                        onToggle={toggle}
                    />
                ))}
            </div>

            {results.length === 0 && (
                <p className="py-10 text-center text-ink-3">Aucune célébrité ne correspond.</p>
            )}

            <DraftTray selected={selected.size} total={TOTAL} />
        </div>
    );
}
