import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CelebrityStatus } from '@/types/celebrity';

interface StatusBadgeProps {
    status: CelebrityStatus;
    /** Death date label, shown when deceased. */
    deathLabel?: string;
    /** Gender label (Homme/Femme/Autre) — agrees the alive/deceased wording. */
    gender?: string;
    className?: string;
}

/** Inflects the alive/deceased word by gender; falls back to the inclusive form. */
function statusWord(dead: boolean, gender?: string): string {
    if (gender === 'Homme') return dead ? 'Décédé' : 'Vivant';
    if (gender === 'Femme') return dead ? 'Décédée' : 'Vivante';
    return dead ? 'Décédé·e' : 'Vivant·e';
}

/** Alive / deceased status pill (nl-status) with an animated dot. */
export function StatusBadge({ status, deathLabel, gender, className }: StatusBadgeProps) {
    const dead = status === 'deceased';
    const word = statusWord(dead, gender);
    return (
        <Badge variant={dead ? 'dead' : 'alive'} className={cn('h-7 gap-1.5 px-2.5', className)}>
            <span
                className={cn(
                    'size-2 rounded-full',
                    dead ? 'bg-coral' : 'animate-pulse-dot bg-neon',
                )}
            />
            {dead && deathLabel ? `${word} · ${deathLabel}` : word}
        </Badge>
    );
}
