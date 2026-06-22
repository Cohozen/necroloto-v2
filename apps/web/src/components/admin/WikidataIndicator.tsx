import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WikidataIndicatorProps {
    /** Whether the celebrity is linked to a Wikidata entity. */
    linked: boolean;
    className?: string;
}

/** Compact pill flagging whether a catalogue row is linked to Wikidata. */
export function WikidataIndicator({ linked, className }: WikidataIndicatorProps) {
    const label = linked ? 'Lié à Wikidata' : 'Sans Wikidata';
    return (
        <span
            role="img"
            title={label}
            aria-label={label}
            className={cn(
                'inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold',
                linked
                    ? 'border-neon/40 bg-neon/10 text-neon'
                    : 'border-line-2 bg-surface-2 text-ink-3',
                className,
            )}
        >
            <Globe size={12} strokeWidth={2.2} />
            {linked ? 'Wikidata' : 'Sans'}
        </span>
    );
}
