import { Logo } from '@/components/layout/Logo';
import { NeonSurface } from '@/components/layout/NeonSurface';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * App-gate skeleton shown while Clerk resolves the session (_app.tsx).
 * Ported from the "redirect / app-gate" mock in docs/mockups/screens/auth.js.
 */
export function AppLoadingGate() {
    return (
        <NeonSurface className="flex h-dvh items-center justify-center p-6">
            <div className="relative z-[1] flex w-full max-w-[300px] flex-col items-center gap-6 text-center">
                <span className="flex size-[118px] items-center justify-center rounded-2xl border border-line-2 bg-surface">
                    <Logo cell={6} />
                </span>
                <div>
                    <div className="font-display text-[26px] font-extrabold">
                        On prépare votre cockpit…
                    </div>
                    <div className="mt-1.5 text-[12.5px] text-ink-3">
                        Synchronisation de vos cercles &amp; paris
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2.5">
                    <Skeleton className="h-[54px] rounded-xl" />
                    <Skeleton className="h-[54px] rounded-xl" />
                    <Skeleton className="h-3.5 w-3/5 rounded-md" />
                </div>
            </div>
        </NeonSurface>
    );
}
