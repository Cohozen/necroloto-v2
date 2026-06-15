import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Circle-admin authority badge (nl-rolebadge) — neon, from Membership.role. */
export function CircleRoleBadge({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex h-[30px] items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 pl-2 pr-3 text-xs font-bold text-neon',
                className,
            )}
        >
            <Crown size={13} strokeWidth={2} /> Admin du cercle
        </span>
    );
}
