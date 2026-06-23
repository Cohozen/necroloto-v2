import { CATALOG_COLS } from '@/components/admin/CelebrityRow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Loading placeholder shaped like CelebrityTable (desktop rows + mobile cards). */
export function CelebrityTableSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <>
            {/* Desktop: dense table rows */}
            <div className="hidden overflow-x-auto md:block">
                <div className="min-w-[860px] overflow-hidden rounded-2xl border border-line bg-surface">
                    <div
                        className={cn(
                            'grid items-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3',
                            CATALOG_COLS,
                        )}
                    >
                        <Skeleton className="size-4 rounded" />
                        <div />
                        <div>Nom</div>
                        <div>Naissance</div>
                        <div>Statut</div>
                        <div>Points</div>
                        <div>Paris</div>
                        <div className="text-right">Actions</div>
                    </div>
                    {Array.from({ length: rows }, (_, i) => (
                        <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder, no reorder
                            key={i}
                            className={cn(
                                'grid items-center border-t border-line px-3 py-3',
                                CATALOG_COLS,
                            )}
                        >
                            <Skeleton className="size-4 rounded" />
                            <Skeleton className="size-9 rounded-full" />
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3.5 w-16 rounded" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-8 rounded" />
                            <Skeleton className="h-4 w-6 rounded" />
                            <div className="flex justify-end gap-1.5">
                                <Skeleton className="size-8 rounded-lg" />
                                <Skeleton className="size-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="flex flex-col gap-3 md:hidden">
                {Array.from({ length: Math.min(rows, 5) }, (_, i) => (
                    <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder, no reorder
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
                    >
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="size-12 shrink-0 rounded-full" />
                        <div className="flex flex-1 flex-col gap-2">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                        <Skeleton className="size-9 rounded-lg" />
                    </div>
                ))}
            </div>
        </>
    );
}
