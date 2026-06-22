import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CelebritySummary } from '@/types/celebrity';
import { CelebrityPortrait } from './CelebrityPortrait';
import { StatusBadge } from './StatusBadge';
import { Badge } from '../ui/badge';

interface CelebrityCardProps {
    celebrity: CelebritySummary;
    selected: boolean;
    onToggle: (id: string) => void;
    /** Read-only mode (circle list locked): no toggling, dimmed. */
    disabled?: boolean;
}

/** Selectable celebrity card for the draft grid (nl-celeb). */
export function CelebrityCard({ celebrity, selected, onToggle, disabled }: CelebrityCardProps) {
    const { id, name, age, born, role, status, proposalStatus, photo } = celebrity;
    const isPending = proposalStatus === 'pending';
    const meta = [age > 0 ? `${age} ans` : null, born > 0 ? `${born}` : null]
        .filter(Boolean)
        .join(' · ');
    return (
        <button
            type="button"
            onClick={() => onToggle(id)}
            disabled={disabled}
            aria-pressed={selected}
            className={cn(
                'relative flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-[11px] text-left transition-all hover:-translate-y-0.5 hover:border-line-2',
                selected && 'border-neon/70 shadow-glow-green',
                disabled && 'opacity-60 hover:translate-y-0 hover:border-line',
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
            <CelebrityPortrait
                name={name}
                status={status}
                photo={photo}
                className="aspect-square w-full"
            />
            <div>
                <div className="text-sm font-bold leading-tight">{name}</div>
                <div className="text-xs text-ink-3">{meta || '—'}</div>
                <div className="text-xs text-ink-3 truncate">{role || '—'}</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={status} className="h-6 px-1 text-[10px] md:text-xs" />
                {isPending && (
                    <Badge variant="secondary" className="h-6 px-1 text-[10px] md:text-xs px-2.5">
                        En attente
                    </Badge>
                )}
            </div>
        </button>
    );
}
