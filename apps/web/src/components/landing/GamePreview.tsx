import type { LucideIcon } from 'lucide-react';
import { Eye, Ghost, Trophy, Zap } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PodiumPlace {
    initials: string;
    name: string;
    points: number;
    place: 1 | 2 | 3;
    gradient: string;
}

const PODIUM: PodiumPlace[] = [
    { place: 2, initials: 'V', name: 'Vous', points: 420, gradient: 'from-[#22E6FF] to-[#3C6BFF]' },
    {
        place: 1,
        initials: 'S',
        name: 'Sasha V.',
        points: 615,
        gradient: 'from-[#22E6FF] to-[#3C6BFF]',
    },
    {
        place: 3,
        initials: 'L',
        name: 'Léa K.',
        points: 405,
        gradient: 'from-[#FF2E97] to-[#7A3CFF]',
    },
];

const MEDAL: Record<number, string> = {
    1: 'bg-neon text-bg shadow-glow-soft',
    2: 'bg-[#c8c9d6] text-bg',
    3: 'bg-coral text-bg',
};

const FEATURES: { icon: LucideIcon; text: React.ReactNode }[] = [
    {
        icon: Trophy,
        text: (
            <>
                <b className="font-semibold text-ink">Podium top 3 mis en avant</b> avec halo néon —
                la gloire se voit de loin.
            </>
        ),
    },
    {
        icon: Eye,
        text: (
            <>
                <b className="font-semibold text-ink">Voyez les mises de chacun</b> et découvrez qui
                a parié sur qui dans votre cercle.
            </>
        ),
    },
    {
        icon: Zap,
        text: (
            <>
                <b className="font-semibold text-ink">Points en temps réel</b> : un bandeau « décès
                récents » signale chaque pronostic gagnant.
            </>
        ),
    },
];

function PodiumCell({ place }: { place: PodiumPlace }) {
    const first = place.place === 1;
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border border-line bg-gradient-to-b from-surface-2 to-surface px-2 pb-3 pt-4 text-center',
                first && '-translate-y-2 border-neon/50 shadow-glow-green',
                place.place === 3 && 'border-coral/40',
            )}
        >
            <span
                className={cn(
                    'flex size-5 items-center justify-center rounded-full font-display text-[11px] font-extrabold',
                    MEDAL[place.place],
                )}
            >
                {place.place}
            </span>
            <Avatar
                className={cn(first ? 'size-[42px]' : 'size-9', first && 'ring-2 ring-neon/65')}
            >
                <AvatarFallback
                    className={cn(
                        'bg-gradient-to-br font-display font-extrabold text-white',
                        place.gradient,
                    )}
                >
                    {place.initials}
                </AvatarFallback>
            </Avatar>
            <div className="whitespace-nowrap text-xs font-bold">{place.name}</div>
            <div
                className={cn(
                    'font-display text-lg font-extrabold leading-none',
                    first ? 'text-neon' : place.place === 3 ? 'text-coral' : 'text-ink',
                )}
            >
                {place.points}
            </div>
        </div>
    );
}

/** Game preview — a browser-framed mini leaderboard next to feature copy. */
export function GamePreview() {
    return (
        <section id="preview" className="px-5 py-14">
            <div className="mx-auto grid w-full max-w-[1180px] items-center gap-7 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
                {/* browser-framed mock */}
                <div className="relative rounded-[22px] border border-line-2 bg-gradient-to-b from-surface-2 to-bg-2 p-3.5 shadow-[0_30px_80px_rgb(0_0_0/0.5)]">
                    <div className="flex items-center gap-[7px] px-2 pb-3.5 pt-1.5">
                        <i className="size-2.5 rounded-full bg-coral/70" />
                        <i className="size-2.5 rounded-full bg-[rgb(255_210_60/0.6)]" />
                        <i className="size-2.5 rounded-full bg-neon/70" />
                        <span className="ml-2 font-mono text-[11px] text-ink-3">
                            necroloto.app/cercle/faucheurs
                        </span>
                    </div>
                    <div className="rounded-[14px] border border-line bg-bg p-[18px] [background-image:radial-gradient(700px_320px_at_80%_-10%,rgb(var(--neon-rgb)/0.08),transparent_60%)]">
                        <div className="mb-4 flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-[38px] items-center justify-center rounded-[11px] border border-line bg-surface-2">
                                    <Logo cell={2} />
                                </span>
                                <div>
                                    <div className="text-[15px] font-bold leading-tight">
                                        Les Faucheurs du Dimanche
                                    </div>
                                    <div className="text-xs text-ink-3">
                                        8 joueurs · saison 2026
                                    </div>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 text-sm font-bold text-neon shadow-glow-soft">
                                615 pts
                            </span>
                        </div>

                        <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-2">
                            {PODIUM.map((place) => (
                                <PodiumCell key={place.initials} place={place} />
                            ))}
                        </div>

                        <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-coral/25 bg-gradient-to-r from-coral/10 to-surface px-3 py-2.5">
                            <Ghost
                                size={20}
                                className="text-coral drop-shadow-[0_0_8px_rgb(var(--coral-rgb)/0.6)]"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-[13.5px] font-bold">
                                    Dame Gloria Ravensworth, 96
                                </div>
                                <div className="text-xs text-ink-3">
                                    a rapporté des points à 3 joueurs · il y a 2 j
                                </div>
                            </div>
                            <span className="font-display text-lg font-extrabold text-coral">
                                +140
                            </span>
                        </div>
                    </div>
                </div>

                {/* copy */}
                <div className="lg:order-first">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                        Un aperçu
                    </span>
                    <h2 className="mt-3 font-display text-[clamp(28px,7vw,46px)] font-extrabold leading-none tracking-[-0.01em]">
                        Le classement,
                        <br />
                        en un coup d'œil
                    </h2>
                    <p className="mt-3 max-w-[46ch] text-[15px] text-ink-2">
                        Podium néon, points qui pulsent, décès qui rapportent en direct. Tout est
                        pensé pour le check rapide depuis le téléphone — et la revanche du dimanche
                        soir.
                    </p>
                    <ul className="mt-5 flex flex-col gap-3.5">
                        {FEATURES.map((feature) => (
                            <li
                                key={feature.icon.displayName ?? feature.icon.name}
                                className="flex items-start gap-3 text-[14.5px] text-ink-2"
                            >
                                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] border border-neon/30 bg-neon/10 text-neon">
                                    <feature.icon size={17} />
                                </span>
                                <span>{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
