import { cn } from '@/lib/utils';
import { LoaderInvader } from './LoaderInvader';

interface SectionLoaderProps {
    /** Contextual label, e.g. "Chargement des paris…". */
    label?: string;
    /** Compact variant for inline spots like "load more" sentinels. */
    inline?: boolean;
    className?: string;
}

/**
 * Centered loading state for inline sections (within a card/list area). The
 * animated brand invader + label, padded so it reads as "loading" rather than
 * a stray line of grey text. `inline` shrinks it for "load more" sentinels.
 */
export function SectionLoader({ label = 'Chargement…', inline, className }: SectionLoaderProps) {
    return (
        <div
            className={cn(
                'flex w-full flex-col items-center justify-center text-center',
                inline ? 'gap-2 py-4' : 'gap-3.5 py-12',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <LoaderInvader cell={inline ? 3 : 4} />
            <p className="text-[13px] text-ink-3">{label}</p>
        </div>
    );
}
