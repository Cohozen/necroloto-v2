import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Global-admin role badge (nl-rolebadge) — signals catalogue mutation rights. */
export function AdminBadge({ label = 'Admin', className }: { label?: string; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex h-[30px] items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 pl-2.5 pr-3 text-xs font-bold text-neon',
                className,
            )}
        >
            <Shield size={13} strokeWidth={2} /> {label}
        </span>
    );
}
