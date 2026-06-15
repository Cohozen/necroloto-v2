import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

/** Ringed, gently floating invader illustration for empty states (nl-empty-art). */
export function EmptyArt({ cell = 6, className }: { cell?: number; className?: string }) {
    return (
        <div
            className={cn(
                'relative flex size-[132px] items-center justify-center rounded-full',
                '[background:radial-gradient(circle_at_50%_38%,rgb(var(--neon-rgb)/0.16),transparent_62%)]',
                className,
            )}
        >
            <span className="absolute inset-0 rounded-full border-[1.5px] border-neon/30" />
            <span className="absolute inset-4 rounded-full border-[1.5px] border-magenta/[0.28]" />
            <span className="relative z-[1] animate-float text-neon drop-shadow-[0_0_16px_rgb(var(--neon-rgb)/0.7)]">
                <Logo cell={cell} />
            </span>
        </div>
    );
}
