import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

interface LoaderInvaderProps {
    /** Pixel size of one invader cell (forwarded to Logo). */
    cell?: number;
    className?: string;
}

/**
 * Animated brand mark used as the app's loading motif: the neon space-invader
 * breathes (scale + glow pulse). Motion is disabled via the global
 * prefers-reduced-motion reset in globals.css.
 */
export function LoaderInvader({ cell = 5, className }: LoaderInvaderProps) {
    return (
        <span
            className={cn('inline-flex items-center justify-center animate-loader-glow', className)}
            aria-hidden="true"
        >
            <Logo cell={cell} />
        </span>
    );
}
