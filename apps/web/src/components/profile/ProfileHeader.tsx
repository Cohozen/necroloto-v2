import { Flame } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { PlayerProfile } from '@/types/profile';

interface ProfileHeaderProps {
    profile: PlayerProfile;
}

/** Identity card (nl-profhead) — avatar, handle, level row. */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-line-2 px-5 py-[22px] [background:radial-gradient(120%_160%_at_18%_-40%,rgb(var(--neon-rgb)/0.18),transparent_58%),radial-gradient(120%_160%_at_90%_-30%,rgb(var(--magenta-rgb)/0.12),transparent_55%),linear-gradient(180deg,var(--color-surface-2),var(--color-surface))] md:px-7 md:py-[26px]">
            {/* faint grid, fading downward */}
            <span className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />

            <div className="relative z-[1] flex items-center gap-4 md:gap-[22px]">
                <Avatar className="size-[76px] shrink-0 ring-2 ring-neon/60 ring-offset-2 ring-offset-bg md:size-[92px]">
                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-2xl font-extrabold text-[#07140b]">
                        {profile.initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
                    <div className="font-display text-[26px] font-extrabold leading-none tracking-[0.01em] md:text-[32px]">
                        {profile.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-[13px] text-neon">{profile.handle}</span>
                        <span className="text-xs text-ink-3">· depuis {profile.joinedLabel}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3">
                        <span className="rounded-[7px] bg-neon px-[9px] py-[3px] font-display text-[13px] font-extrabold text-neon-ink shadow-glow-soft">
                            RANG {profile.rank}
                        </span>
                        <Badge variant="streak" className="h-6 gap-1.5 px-2.5">
                            <Flame size={13} /> Série {profile.streak}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
