import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

type CircleTab = 'leaderboard' | 'bets' | 'members' | 'settings';

const tabClass =
    'rounded-lg px-3.5 py-[7px] text-[13px] font-semibold whitespace-nowrap transition-colors';
const onClass = 'bg-neon text-neon-ink shadow-glow-soft';
const offClass = 'text-ink-2 hover:text-ink';

/** In-circle tab nav: Classement · Paris · Membres · Réglages (nl-tabs). */
export function CircleTabs({ id, active }: { id: string; active: CircleTab }) {
    return (
        <div className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1">
            <Link
                to="/circles/$id"
                params={{ id }}
                className={cn(tabClass, active === 'leaderboard' ? onClass : offClass)}
            >
                Classement
            </Link>
            <Link
                to="/circles/$id/bets"
                params={{ id }}
                className={cn(tabClass, active === 'bets' ? onClass : offClass)}
            >
                Paris
            </Link>
            <Link
                to="/circles/$id/members"
                params={{ id }}
                className={cn(tabClass, active === 'members' ? onClass : offClass)}
            >
                Membres
            </Link>
            <Link
                to="/circles/$id/settings"
                params={{ id }}
                className={cn(tabClass, active === 'settings' ? onClass : offClass)}
            >
                Réglages
            </Link>
        </div>
    );
}
