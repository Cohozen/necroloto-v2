import { Crown, User } from 'lucide-react';
import type { MemberRole } from '@/types/circle';

/** Member role pill — admin (neon, crown) vs. member (neutral). */
export function RolePill({ role }: { role: MemberRole }) {
    if (role === 'admin') {
        return (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-neon/45 bg-neon/[0.08] px-2.5 text-xs font-semibold text-neon">
                <Crown size={13} strokeWidth={1.9} /> Admin
            </span>
        );
    }
    return (
        <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
            <User size={12} /> Membre
        </span>
    );
}
