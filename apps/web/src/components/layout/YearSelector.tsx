import { Calendar, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { YearSelectorProps } from './YearSelector.types';

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEARS = [0, 1, 2, 3].map((n) => CURRENT_YEAR - n);

/** Year picker pill (nl-year) — first-class year navigation. */
export function YearSelector({ value, onValueChange, years = DEFAULT_YEARS }: YearSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2.5 rounded-[11px] border border-line-2 bg-surface px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-neon/40">
                <Calendar size={16} className="text-ink-2" />
                <b className="font-display text-xl font-extrabold tracking-wider">{value}</b>
                <ChevronDown size={15} className="text-ink-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {years.map((year) => (
                    <DropdownMenuItem key={year} onSelect={() => onValueChange(year)}>
                        <span className="font-display text-base font-bold">{year}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
