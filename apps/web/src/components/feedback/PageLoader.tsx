import { cn } from '@/lib/utils';
import { LoaderInvader } from './LoaderInvader';

interface PageLoaderProps {
    /** Contextual label, e.g. "Chargement de votre profil…". */
    label?: string;
    className?: string;
}

/**
 * Full-area, centered loading state for route-level early returns: the animated
 * brand invader over a contextual label, vertically + horizontally centered so
 * it fills the empty route shell instead of a tiny top-left text.
 */
export function PageLoader({ label = 'Chargement…', className }: PageLoaderProps) {
    return (
        <div
            className={cn(
                'flex min-h-[60vh] w-full flex-col items-center justify-center gap-5 p-6 text-center',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <LoaderInvader cell={6} />
            <p className="text-[13px] font-medium text-ink-3">{label}</p>
        </div>
    );
}
