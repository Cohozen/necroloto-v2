import { useNavigate } from '@tanstack/react-router';
import { Bell, Search } from 'lucide-react';
import { useUnreadNotificationsCount } from '@/lib/api/queries';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

const iconBtn =
    'inline-flex size-[38px] items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2 md:size-[42px]';

interface TopBarProps {
    /** Opens the global search palette (⌘K). */
    onOpenSearch: () => void;
}

/** App header — desktop (search + bell + account) and mobile (logo + search + bell + account). */
export function TopBar({ onOpenSearch }: TopBarProps) {
    const navigate = useNavigate();
    const { data: unread } = useUnreadNotificationsCount();
    const count = unread?.count ?? 0;

    return (
        <header className="flex items-center gap-3 border-b border-line bg-bg/55 px-4 py-3.5 backdrop-blur-md md:gap-3.5 md:px-5.5">
            {/* mobile: brand */}
            <Logo cell={3.5} withWord className="md:hidden" />

            {/* desktop: search */}
            <button
                type="button"
                onClick={onOpenSearch}
                className="hidden h-10 max-w-[380px] flex-1 items-center gap-2.5 rounded-[11px] border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 transition-colors hover:border-line hover:text-ink-2 md:flex"
            >
                <Search size={16} />
                <span className="truncate">Rechercher une célébrité, un cercle…</span>
                <kbd className="ml-auto rounded border border-line-2 bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-ink-2">
                    ⌘K
                </kbd>
            </button>

            <div className="flex-1 md:flex-none" />

            {/* mobile: search trigger (desktop uses the bar above) */}
            <button
                type="button"
                aria-label="Rechercher"
                onClick={onOpenSearch}
                className={`${iconBtn} md:hidden`}
            >
                <Search size={18} />
            </button>
            <button
                type="button"
                aria-label="Notifications"
                onClick={() => navigate({ to: '/notifications' })}
                className={`${iconBtn} relative`}
            >
                <Bell size={18} />
                {count > 0 && (
                    <span className="-right-1 -top-1 absolute inline-flex min-w-[18px] items-center justify-center rounded-full bg-coral px-1 font-medium text-[10px] text-bg leading-[18px] shadow-glow-coral">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>
            {/* Account avatar lives here on mobile; on desktop it sits at the bottom of the side rail. */}
            <span className="md:hidden">
                <UserMenu />
            </span>
        </header>
    );
}
