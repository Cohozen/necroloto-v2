import { Link } from '@tanstack/react-router';
import { Skull } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DeathFeedEntry } from '@/types/feed';

interface DeathFeedItemProps {
    entry: DeathFeedEntry;
}

/** "Décès récents" row — a death that scored points (nl-feed). Links to the fiche. */
export function DeathFeedItem({ entry }: DeathFeedItemProps) {
    return (
        <Link
            to="/celebrities/$id"
            params={{ id: entry.id }}
            className="flex items-center gap-3.5 rounded-xl border border-coral/20 bg-gradient-to-r from-coral/8 to-surface px-3.5 py-3 transition-colors hover:border-coral/45 hover:to-surface-2"
        >
            <span className="flex text-coral drop-shadow-[0_0_8px_rgb(var(--coral-rgb)/0.6)]">
                <Skull size={22} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">
                    {entry.celebrityName}, {entry.age}
                </div>
                <div className="text-xs text-ink-3">
                    {entry.scorers} joueur·s ont marqué · {entry.when}
                </div>
            </div>
            <Badge
                variant="score"
                className="border-coral/40 bg-coral/12 font-display text-base text-coral"
            >
                +{entry.points}
            </Badge>
        </Link>
    );
}
