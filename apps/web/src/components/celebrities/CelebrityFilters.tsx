import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FilterSelect } from '@/components/celebrities/FilterSelect';
import { useCelebrityFacets } from '@/lib/api/queries';
import type { CelebrityFilterValues } from '@/lib/api/types';
import { ageBucketOptions, GENDER_OPTIONS, hasActiveFilters } from '@/lib/celebrities/facets';

interface CelebrityFiltersProps {
    filters: CelebrityFilterValues;
    onChange: (filters: CelebrityFilterValues) => void;
    /** Extra selectors rendered before the facet ones (e.g. admin status/wikidata). */
    leading?: ReactNode;
    /** Whether a `leading` filter is active — keeps the reset button enabled. */
    hasExtraActive?: boolean;
    /** Clears everything (facets + leading). Defaults to clearing the facets. */
    onReset?: () => void;
    /** Matching-rows count shown at the end of the bar. */
    count?: number;
}

/**
 * Catalogue facet filters (category / nationality / gender / age dropdowns),
 * shared by the bet draft and the admin catalogue. Options come from the server
 * (`useCelebrityFacets`); the bar wraps instead of scrolling horizontally.
 */
export function CelebrityFilters({
    filters,
    onChange,
    leading,
    hasExtraActive,
    onReset,
    count,
}: CelebrityFiltersProps) {
    const facetsQuery = useCelebrityFacets();
    const categories = facetsQuery.data?.categories ?? [];
    const nationalities = facetsQuery.data?.nationalities ?? [];

    const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));
    const canReset = hasActiveFilters(filters) || Boolean(hasExtraActive);
    const reset = onReset ?? (() => onChange({}));

    return (
        <div className="flex flex-wrap items-center gap-2">
            {leading}
            <FilterSelect
                placeholder="Catégorie"
                allLabel="Toutes"
                value={filters.category}
                options={toOptions(categories)}
                onSelect={(value) => onChange({ ...filters, category: value })}
            />
            <FilterSelect
                placeholder="Nationalité"
                allLabel="Toutes"
                value={filters.nationality}
                options={toOptions(nationalities)}
                onSelect={(value) => onChange({ ...filters, nationality: value })}
            />
            <FilterSelect
                placeholder="Genre"
                allLabel="Tous"
                value={filters.gender}
                options={toOptions([...GENDER_OPTIONS])}
                onSelect={(value) => onChange({ ...filters, gender: value })}
            />
            <FilterSelect
                placeholder="Âge"
                allLabel="Tout âge"
                value={filters.age}
                options={ageBucketOptions()}
                onSelect={(value) => onChange({ ...filters, age: value })}
            />
            <button
                type="button"
                onClick={reset}
                disabled={!canReset}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line-2 bg-surface px-3 text-[13px] font-semibold text-ink-3 transition-colors hover:text-coral disabled:cursor-default disabled:opacity-40 disabled:hover:text-ink-3"
            >
                <X size={14} /> Réinitialiser
            </button>
            {count !== undefined && (
                <span className="ml-auto shrink-0 text-[12.5px] text-ink-3">
                    {count} {count > 1 ? 'célébrités' : 'célébrité'}
                </span>
            )}
        </div>
    );
}
