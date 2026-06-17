import { Globe, Lock } from 'lucide-react';
import type { CircleVisibility } from '@/types/circle';

/** Private / public pill for a circle (nl-pill). */
export function PrivacyBadge({ visibility }: { visibility: CircleVisibility }) {
    const isPrivate = visibility === 'PRIVATE';
    const Icon = isPrivate ? Lock : Globe;
    return (
        <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
            <Icon size={13} /> {isPrivate ? 'Privé' : 'Public'}
        </span>
    );
}
