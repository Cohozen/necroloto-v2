import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CelebrityStatus } from '@/types/celebrity';

interface StatusBadgeProps {
    status: CelebrityStatus;
    /** Death date label, shown when deceased. */
    deathLabel?: string;
    className?: string;
}

/** Alive / deceased status pill (nl-status) with an animated dot. */
export function StatusBadge({ status, deathLabel, className }: StatusBadgeProps) {
    const dead = status === 'deceased';
    return (
        <Badge variant={dead ? 'dead' : 'alive'} className={cn('h-7 gap-1.5 px-2.5', className)}>
            <span
                className={cn(
                    'size-2 rounded-full',
                    dead ? 'bg-coral' : 'animate-pulse-dot bg-neon',
                )}
            />
            {dead ? `Décédé·e${deathLabel ? ` · ${deathLabel}` : ''}` : 'Vivant·e'}
        </Badge>
    );
}
