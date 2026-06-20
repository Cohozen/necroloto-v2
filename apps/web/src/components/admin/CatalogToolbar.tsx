import { Link } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CatalogFilter } from '@/types/admin';

interface CatalogToolbarProps {
    search: string;
    onSearchChange: (search: string) => void;
    filter: CatalogFilter;
    onFilterChange: (filter: CatalogFilter) => void;
    /** Number of celebrities matching the active search + status filter. */
    total: number;
}

const SEGMENTS: { id: CatalogFilter; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'alive', label: 'Vivant·e' },
    { id: 'deceased', label: 'Décédé·e' },
    { id: 'pending', label: 'En attente' },
];

/** Catalogue toolbar — search, status filter, count, and "new" action. */
export function CatalogToolbar({
    search,
    onSearchChange,
    filter,
    onFilterChange,
    total,
}: CatalogToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 focus-within:border-neon/60 sm:max-w-[340px]">
                <Search size={16} />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher un nom…"
                    className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
                />
            </div>

            <div className="inline-flex rounded-[11px] border border-line-2 bg-surface p-1">
                {SEGMENTS.map((seg) => (
                    <button
                        key={seg.id}
                        type="button"
                        onClick={() => onFilterChange(seg.id)}
                        className={cn(
                            'rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                            filter === seg.id
                                ? 'bg-surface-3 text-ink'
                                : 'text-ink-3 hover:text-ink-2',
                        )}
                    >
                        {seg.label}
                    </button>
                ))}
            </div>

            <span className="text-[12.5px] text-ink-3">
                {total} {total > 1 ? 'célébrités' : 'célébrité'}
            </span>

            <Button asChild size="sm" className="ml-auto h-[38px]">
                <Link to="/admin/celebrities/new">
                    <Plus size={15} strokeWidth={2.2} /> Nouvelle célébrité
                </Link>
            </Button>
        </div>
    );
}
