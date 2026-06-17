import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChoiceCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
}

/** Selectable visibility card (nl-choicecard) — neon ring + check when active. */
export function ChoiceCard({
    icon: Icon,
    title,
    description,
    selected,
    onSelect,
}: ChoiceCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'relative flex flex-col gap-1.5 rounded-[14px] border bg-surface p-3.5 text-left transition-all',
                selected
                    ? 'border-neon/70 bg-neon/[0.07] shadow-[0_0_0_1px_rgb(var(--neon-rgb)/0.5),0_0_calc(var(--glow)*20px)_rgb(var(--neon-rgb)/calc(var(--glow)*0.26))]'
                    : 'border-line-2 hover:border-line',
            )}
        >
            <span
                className={cn(
                    'absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border-[1.5px]',
                    selected
                        ? 'border-neon bg-neon text-neon-ink'
                        : 'border-line-2 text-transparent',
                )}
            >
                <Check size={12} strokeWidth={3} />
            </span>
            <Icon size={22} strokeWidth={1.8} className={selected ? 'text-neon' : 'text-ink-2'} />
            <span className="text-sm font-bold">{title}</span>
            <span className="text-xs leading-[1.35] text-ink-3">{description}</span>
        </button>
    );
}
