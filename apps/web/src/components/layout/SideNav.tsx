import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav-items';

/** Desktop vertical nav rail (nl-side). Hidden on mobile. */
export function SideNav() {
    return (
        <aside className="hidden w-[78px] shrink-0 flex-col items-center gap-2 border-r border-line bg-gradient-to-b from-bg-2 to-bg/40 py-5 md:flex">
            <Link to="/dashboard" className="mb-3" aria-label="Accueil">
                <Logo cell={4} />
            </Link>
            {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
                <Link
                    key={to}
                    to={to}
                    aria-label={label}
                    className={cn(
                        'relative flex size-[46px] items-center justify-center rounded-[13px] text-ink-3 transition-colors hover:bg-surface hover:text-ink-2',
                        'data-[status=active]:bg-neon/10 data-[status=active]:text-neon data-[status=active]:shadow-[inset_0_0_0_1px_rgb(var(--neon-rgb)/0.4)]',
                        'data-[status=active]:before:absolute data-[status=active]:before:-left-4 data-[status=active]:before:top-1/2 data-[status=active]:before:h-[22px] data-[status=active]:before:w-[3px] data-[status=active]:before:-translate-y-1/2 data-[status=active]:before:rounded data-[status=active]:before:bg-neon data-[status=active]:before:shadow-[0_0_8px_rgb(var(--neon-rgb)/0.9)]',
                    )}
                >
                    <Icon size={22} />
                </Link>
            ))}
            <div className="flex-1" />
            <Avatar className="size-[42px] ring-2 ring-neon/60 ring-offset-2 ring-offset-bg">
                <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                    ME
                </AvatarFallback>
            </Avatar>
        </aside>
    );
}
