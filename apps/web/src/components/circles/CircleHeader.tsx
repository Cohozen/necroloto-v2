import { Users } from 'lucide-react';
import { PrivacyBadge } from '@/components/circles/PrivacyBadge';
import { Logo } from '@/components/layout/Logo';
import type { CircleVisibility } from '@/types/circle';

interface CircleHeaderProps {
    name: string;
    visibility: CircleVisibility;
    members: number;
}

/** Circle identity header — crest, name, privacy + member count. */
export function CircleHeader({ name, visibility, members }: CircleHeaderProps) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] border border-line-2 bg-surface-3">
                <Logo cell={2} />
            </span>
            <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-extrabold md:text-2xl">{name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <PrivacyBadge visibility={visibility} />
                    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-line-2 bg-surface-3 px-2.5 text-xs font-semibold text-ink-2">
                        <Users size={13} /> {members}
                    </span>
                </div>
            </div>
        </div>
    );
}
