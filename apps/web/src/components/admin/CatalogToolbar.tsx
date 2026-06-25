import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CatalogToolbarProps {
    search: string;
    onSearchChange: (search: string) => void;
}

/** Catalogue search field. Status/facet filters live in the filter bar below. */
export function CatalogToolbar({ search, onSearchChange }: CatalogToolbarProps) {
    return (
        <div className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 focus-within:border-neon/60">
            <Search size={16} />
            <Input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une célébrité…"
            />
        </div>
    );
}
