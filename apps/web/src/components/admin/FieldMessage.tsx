import { Check, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Validation line under a field (nl-msg) — ok = neon/check, error = coral/skull. */
export function FieldMessage({
    kind,
    children,
}: {
    kind: 'ok' | 'error';
    children: React.ReactNode;
}) {
    const Icon = kind === 'ok' ? Check : Skull;
    return (
        <div
            className={cn(
                'flex items-center gap-1.5 text-[12.5px] font-medium',
                kind === 'ok' ? 'text-neon' : 'text-coral',
            )}
        >
            <Icon size={14} strokeWidth={2.2} /> {children}
        </div>
    );
}
