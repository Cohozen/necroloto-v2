import { Check, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    /** Trigger text when no value is selected. */
    placeholder: string;
    /** First entry that clears the selection (e.g. "Toutes", "Tous"). */
    allLabel: string;
    value?: string;
    options: FilterOption[];
    onSelect: (value: string | undefined) => void;
}

/**
 * A single dropdown facet — shows the placeholder until a value is picked (then
 * the option label, with a neon accent). Shared by the catalogue filter bar.
 */
export function FilterSelect({
    placeholder,
    allLabel,
    value,
    options,
    onSelect,
}: FilterSelectProps) {
    const active = Boolean(value);
    const selectedLabel = options.find((o) => o.value === value)?.label;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                        active
                            ? 'border-neon/40 bg-neon/10 text-neon'
                            : 'border-line-2 bg-surface text-ink-2 hover:text-ink',
                    )}
                >
                    {selectedLabel ?? placeholder}
                    <ChevronDown size={14} className={active ? 'text-neon' : 'text-ink-3'} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 w-52 overflow-y-auto">
                <DropdownMenuItem onSelect={() => onSelect(undefined)}>
                    {allLabel}
                    {!active && <Check size={15} className="ml-auto" />}
                </DropdownMenuItem>
                {options.map((option) => (
                    <DropdownMenuItem key={option.value} onSelect={() => onSelect(option.value)}>
                        {option.label}
                        {value === option.value && <Check size={15} className="ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
