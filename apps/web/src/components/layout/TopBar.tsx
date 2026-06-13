import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from './Logo';
import { YearSelector } from './YearSelector';

interface TopBarProps {
    year: number;
    onYearChange: (year: number) => void;
}

const iconBtn =
    'inline-flex size-[38px] items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2 md:size-[42px]';

/** App header — desktop (search + year + bell) and mobile (logo + bell + avatar). */
export function TopBar({ year, onYearChange }: TopBarProps) {
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

            {/* Year selector is desktop-only here; on mobile it lives in-page. */}
            <span className="hidden md:inline-flex">
                <YearSelector value={year} onValueChange={onYearChange} />
            </span>
            <button type="button" aria-label="Notifications" className={iconBtn}>
                <Bell size={18} />
            </button>
            <Avatar className="size-[38px] ring-2 ring-neon/60 ring-offset-2 ring-offset-bg md:hidden">
                <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                    ME
                </AvatarFallback>
            </Avatar>
        </header>
    );
}
