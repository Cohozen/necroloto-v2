import { Search } from 'lucide-react';

interface CatalogToolbarProps {
    search: string;
    onSearchChange: (search: string) => void;
}

/** Catalogue search field. Status/facet filters live in the filter bar below. */
export function CatalogToolbar({ search, onSearchChange }: CatalogToolbarProps) {
    return (
        <div className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 focus-within:border-neon/60 sm:max-w-[340px]">
            <Search size={16} />
            <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un nom…"
                className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
            />
        </div>
    );
}
