import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';

const tabClass = cn(
    'flex flex-1 flex-col items-center gap-[3px] py-1 text-[10px] font-semibold text-ink-3',
    'data-[status=active]:text-neon',
);

/** Mobile bottom tab bar (nl-mbottom) with a centered FAB. Hidden on desktop. */
export function BottomTabBar() {
    const [left, right] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)];
    return (
        <nav className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-around gap-1 border-t border-line bg-gradient-to-b from-bg/20 to-bg/90 px-3.5 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden">
            {left.map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className={tabClass}>
                    <Icon size={22} />
                    {label}
                </Link>
            ))}
            <Link
                to="/circles/new"
                aria-label="Nouveau cercle"
                className="-mt-[22px] flex size-[54px] shrink-0 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-glow-soft"
            >
                <Plus size={24} strokeWidth={2.2} />
            </Link>
            {right.map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className={tabClass}>
                    <Icon size={22} />
                    {label}
                </Link>
            ))}
        </nav>
    );
}
