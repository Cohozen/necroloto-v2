import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CelebritySummary } from '@/types/celebrity';
import { CelebrityPortrait } from './CelebrityPortrait';
import { StatusBadge } from './StatusBadge';

interface CelebrityCardProps {
    celebrity: CelebritySummary;
    selected: boolean;
    onToggle: (id: string) => void;
}

/** Selectable celebrity card for the draft grid (nl-celeb). */
export function CelebrityCard({ celebrity, selected, onToggle }: CelebrityCardProps) {
    const { id, name, age, born, role, status, odds } = celebrity;
    return (
        <button
            type="button"
            onClick={() => onToggle(id)}
            aria-pressed={selected}
            className={cn(
                'relative flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-[11px] text-left transition-all hover:-translate-y-0.5 hover:border-line-2',
                selected && 'border-neon/70 shadow-glow-green',
            )}
        >
            <span
                className={cn(
                    'absolute right-[18px] top-[18px] z-10 flex size-[26px] items-center justify-center rounded-lg border backdrop-blur-sm',
                    selected
                        ? 'border-neon bg-neon text-neon-ink shadow-glow-soft'
                        : 'border-line-2 bg-bg/60 text-transparent',
                )}
            >
                <Check size={16} strokeWidth={2.6} />
            </span>
            <CelebrityPortrait name={name} status={status} className="aspect-square w-full" />
            <div>
                <div className="text-sm font-bold leading-tight">{name}</div>
                <div className="text-xs text-ink-3">
                    {age} ans · °{born} · {role}
                </div>
            </div>
            <div className="flex items-center justify-between gap-2">
                <StatusBadge status={status} className="h-6 px-2 text-[11px]" />
                <span className="inline-flex h-6 items-center gap-1 rounded-md border border-line-2 bg-surface-3 px-2 font-mono text-xs font-bold">
                    <Zap size={12} /> {odds}
                </span>
            </div>
        </button>
    );
}
