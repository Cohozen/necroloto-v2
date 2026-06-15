import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { PodiumSlot } from '@/types/circle';

const MEDAL: Record<number, string> = {
    1: 'bg-neon text-bg shadow-glow-soft',
    2: 'bg-[#c8c9d6] text-bg',
    3: 'bg-coral text-bg',
};

const fmt = (n: number) => n.toLocaleString('fr-FR');

/** Compact top-3 podium preview (nl-mpod) — rendered 2 · 1 · 3. */
export function MiniPodium({ podium }: { podium: PodiumSlot[] }) {
    const byPlace = (place: number) => podium.find((slot) => slot.place === place);
    const ordered = [byPlace(2), byPlace(1), byPlace(3)].filter(
        (slot): slot is PodiumSlot => slot != null,
    );

    return (
        <div className="grid grid-cols-3 items-end gap-2 rounded-xl border border-line bg-bg p-3 [background-image:radial-gradient(120%_120%_at_50%_-20%,rgb(var(--neon-rgb)/0.06),transparent_60%)]">
            {ordered.map((slot) => {
                const first = slot.place === 1;
                return (
                    <div
                        key={slot.place}
                        className={cn(
                            'relative flex flex-col items-center gap-1.5 text-center',
                            first && '-translate-y-1.5',
                        )}
                    >
                        <span
                            className={cn(
                                'absolute -top-[7px] z-[2] flex size-[17px] items-center justify-center rounded-full font-display text-[10px] font-extrabold',
                                MEDAL[slot.place],
                            )}
                        >
                            {slot.place}
                        </span>
                        <Avatar
                            className={cn(
                                first ? 'size-[34px]' : 'size-7',
                                slot.ring === 'neon' && 'ring-2 ring-neon/65',
                                slot.ring === 'mag' && 'ring-2 ring-magenta/70',
                            )}
                        >
                            <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-[11px] font-extrabold text-[#07140b]">
                                {slot.initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-full truncate text-[11px] font-semibold text-ink-2">
                            {slot.name}
                        </div>
                        <div
                            className={cn(
                                'font-display font-extrabold leading-none',
                                first ? 'text-[21px] text-neon' : 'text-lg text-ink',
                            )}
                        >
                            {fmt(slot.points)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
