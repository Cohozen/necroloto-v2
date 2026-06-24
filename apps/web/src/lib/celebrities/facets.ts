import type { CelebrityFilterValues } from '@/lib/api/types';

/**
 * Catalogue filter facets shared by the bet draft and the admin catalogue.
 * Age is selected as a bucket id; the helper below resolves it to the
 * `ageMin`/`ageMax` query params the API understands.
 */
export interface AgeBucket {
    id: string;
    label: string;
    min?: number;
    max?: number;
}

export const AGE_BUCKETS: AgeBucket[] = [
    { id: 'lt30', label: '− de 30', max: 29 },
    { id: '30-44', label: '30–44', min: 30, max: 44 },
    { id: '45-59', label: '45–59', min: 45, max: 59 },
    { id: '60-74', label: '60–74', min: 60, max: 74 },
    { id: '75plus', label: '75 +', min: 75 },
];

/** Gender labels (mirror the API's `deriveGender`). */
export const GENDER_OPTIONS = ['Homme', 'Femme', 'Autre'] as const;

/** True when at least one facet filter is active. */
export function hasActiveFilters(filters: CelebrityFilterValues): boolean {
    return Boolean(filters.category || filters.nationality || filters.gender || filters.age);
}

/** Appends the active facet filters to a query string (age → ageMin/ageMax). */
export function appendFilterParams(qs: URLSearchParams, filters: CelebrityFilterValues): void {
    if (filters.category) qs.set('category', filters.category);
    if (filters.nationality) qs.set('nationality', filters.nationality);
    if (filters.gender) qs.set('gender', filters.gender);

    const bucket = AGE_BUCKETS.find((b) => b.id === filters.age);
    if (bucket?.min !== undefined) qs.set('ageMin', String(bucket.min));
    if (bucket?.max !== undefined) qs.set('ageMax', String(bucket.max));
}
