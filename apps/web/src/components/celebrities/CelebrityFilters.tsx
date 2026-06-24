import { Check, ChevronDown, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCelebrityFacets } from '@/lib/api/queries';
import type { CelebrityFilterValues } from '@/lib/api/types';
import { AGE_BUCKETS, GENDER_OPTIONS, hasActiveFilters } from '@/lib/celebrities/facets';
import { cn } from '@/lib/utils';

interface CelebrityFiltersProps {
    filters: CelebrityFilterValues;
    onChange: (filters: CelebrityFilterValues) => void;
}

/**
 * Catalogue facet filters (category / nationality / gender dropdowns + age pills),
 * shared by the bet draft and the admin catalogue. Options come from the server
 * (`useCelebrityFacets`); the selection drives server-side filtering via the hooks.
 */
export function CelebrityFilters({ filters, onChange }: CelebrityFiltersProps) {
    const facetsQuery = useCelebrityFacets();
    const categories = facetsQuery.data?.categories ?? [];
    const nationalities = facetsQuery.data?.nationalities ?? [];

    const toggleAge = (id: string) => {
        const next = filters.age === id ? undefined : id;
        onChange({ ...filters, age: next });
    };

    return (
        <div className="flex flex-col gap-2.5">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                <FilterSelect
                    label="Catégorie"
                    value={filters.category}
                    options={categories}
                    onSelect={(value) => onChange({ ...filters, category: value })}
                />
                <FilterSelect
                    label="Nationalité"
                    value={filters.nationality}
                    options={nationalities}
                    onSelect={(value) => onChange({ ...filters, nationality: value })}
                />
                <FilterSelect
                    label="Genre"
                    value={filters.gender}
                    options={[...GENDER_OPTIONS]}
                    onSelect={(value) => onChange({ ...filters, gender: value })}
                />
                {hasActiveFilters(filters) && (
                    <button
                        type="button"
                        onClick={() => onChange({})}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line-2 bg-surface px-3 text-[13px] font-semibold text-ink-3 hover:text-coral"
                    >
                        <X size={14} /> Réinitialiser
                    </button>
                )}
            </div>

            <div className="no-scrollbar -mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
                <div className="inline-flex shrink-0 rounded-[11px] border border-line-2 bg-surface p-1">
                    {AGE_BUCKETS.map((bucket) => (
                        <button
                            key={bucket.id}
                            type="button"
                            onClick={() => toggleAge(bucket.id)}
                            className={cn(
                                'shrink-0 whitespace-nowrap rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors',
                                filters.age === bucket.id
                                    ? 'bg-surface-3 text-ink'
                                    : 'text-ink-3 hover:text-ink-2',
                            )}
                        >
                            {bucket.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface FilterSelectProps {
    label: string;
    value?: string;
    options: string[];
    onSelect: (value: string | undefined) => void;
}

/** A single dropdown facet — shows the label until a value is picked (then neon). */
function FilterSelect({ label, value, options, onSelect }: FilterSelectProps) {
    const active = Boolean(value);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                        active
                            ? 'border-neon/40 bg-neon/10 text-neon'
                            : 'border-line-2 bg-surface text-ink-2 hover:text-ink',
                    )}
                >
                    {value ?? label}
                    <ChevronDown size={14} className={active ? 'text-neon' : 'text-ink-3'} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 w-52 overflow-y-auto">
                <DropdownMenuItem onSelect={() => onSelect(undefined)}>
                    Toutes
                    {!active && <Check size={15} className="ml-auto" />}
                </DropdownMenuItem>
                {options.map((option) => (
                    <DropdownMenuItem key={option} onSelect={() => onSelect(option)}>
                        {option}
                        {value === option && <Check size={15} className="ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
