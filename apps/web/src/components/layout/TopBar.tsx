import { Bell, Search } from 'lucide-react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

const iconBtn =
    'inline-flex size-[38px] items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2 md:size-[42px]';

/** App header — desktop (search + bell + account) and mobile (logo + bell + account). */
export function TopBar() {
    return (
        <header className="flex items-center gap-3 border-b border-line bg-bg/55 px-4 py-3.5 backdrop-blur-md md:gap-3.5 md:px-5.5">
            {/* mobile: brand */}
            <Logo cell={3.5} withWord className="md:hidden" />

            {/* desktop: search */}
            <div className="hidden h-10 max-w-[380px] flex-1 items-center gap-2.5 rounded-[11px] border border-line-2 bg-surface px-3.5 text-[13px] text-ink-3 md:flex">
                <Search size={16} />
                <span className="truncate">Rechercher une célébrité, un cercle…</span>
                <kbd className="ml-auto rounded border border-line-2 bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-ink-2">
                    ⌘K
                </kbd>
            </div>

            <div className="flex-1 md:flex-none" />

            <button type="button" aria-label="Notifications" className={iconBtn}>
                <Bell size={18} />
            </button>
            {/* Account avatar lives here on mobile; on desktop it sits at the bottom of the side rail. */}
            <span className="md:hidden">
                <UserMenu />
            </span>
        </header>
    );
}
