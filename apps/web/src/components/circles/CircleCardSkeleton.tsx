import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Loading placeholder shaped like CircleCard (avoids layout shift on the grid). */
export function CircleCardSkeleton() {
    return (
        <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-[18px]">
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="size-[46px] shrink-0 rounded-[13px]" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-28 rounded-md" />
                        <Skeleton className="h-[26px] w-32 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2.5">
                <Skeleton className="h-[34px] w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-end justify-between gap-3 border-t border-line pt-[11px]">
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-2.5 w-16 rounded" />
                    <Skeleton className="h-8 w-12 rounded-md" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
            </div>
        </div>
    );
}

/** A grid of CircleCardSkeleton matching the dashboard / hub layout. */
export function CircleCardGridSkeleton({
    count = 4,
    className = 'sm:grid-cols-2 lg:grid-cols-3',
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div className={cn('grid gap-4', className)}>
            {Array.from({ length: count }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder, no reorder
                <CircleCardSkeleton key={i} />
            ))}
        </div>
    );
}
