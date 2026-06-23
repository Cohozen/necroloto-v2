import { Skeleton } from '@/components/ui/skeleton';

/** Loading placeholder shaped like the leaderboard (podium card + rows + rail). */
export function LeaderboardSkeleton() {
    return (
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="flex flex-col gap-4">
                {/* podium card */}
                <div className="rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-4 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <Skeleton className="h-3 w-32 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <div className="flex items-end justify-center gap-3">
                        {[44, 64, 36].map((h) => (
                            <div key={h} className="flex flex-1 flex-col items-center gap-2">
                                <Skeleton className="size-12 rounded-full" />
                                <Skeleton className="h-3 w-12 rounded" />
                                <Skeleton className="w-full rounded-t-lg" style={{ height: h }} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* rows */}
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder, no reorder
                            key={i}
                            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                        >
                            <Skeleton className="size-7 rounded-full" />
                            <Skeleton className="size-9 rounded-full" />
                            <Skeleton className="h-4 flex-1 rounded" />
                            <Skeleton className="h-5 w-12 rounded" />
                        </div>
                    ))}
                </div>
            </div>
            {/* right rail */}
            <div className="hidden lg:block">
                <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
        </div>
    );
}
