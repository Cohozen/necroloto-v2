import { Link } from '@tanstack/react-router';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATS = [
    { value: '8 420', label: 'Joueurs' },
    { value: '612', label: 'Cercles actifs' },
    { value: '2026', label: 'Saison ouverte' },
];

/** Hero — arcade wordmark, headline, primary CTAs and trust stats. */
export function LandingHero() {
    return (
        <section
            id="top"
            className="relative px-5 pb-16 pt-14 text-center lg:pb-[88px] lg:pt-[88px]"
        >
            <div className="mx-auto w-full max-w-[1180px]">
                <span className="inline-flex h-[30px] items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3.5 text-xs font-semibold tracking-[0.04em] text-neon">
                    <span className="size-[7px] animate-pulse-dot rounded-full bg-neon" />
                    Saison 2026 · inscriptions ouvertes
                </span>

                <h1 className="mt-[22px] font-arcade text-[clamp(40px,13vw,96px)] leading-[0.9] tracking-[0.02em] text-glow-neon [text-shadow:0_0_calc(var(--glow)*30px)_rgb(var(--neon-rgb)/calc(var(--glow)*0.45))]">
                    NECRO<span className="text-neon">LOTO</span>
                </h1>

                <p className="mx-auto mt-[18px] max-w-[18ch] text-balance font-display text-[clamp(34px,8.4vw,66px)] font-extrabold leading-[1.04] tracking-[-0.01em]">
                    Défiez le destin,
                    <br />
                    <span className="text-neon">anticipez</span>{' '}
                    <span className="text-magenta">l'avenir</span>.
                </p>

                <p className="mx-auto mt-[22px] max-w-[40ch] text-pretty text-[clamp(15px,4vw,18px)] text-ink-2">
                    Le jeu de pronostics le plus culotté entre potes. Composez votre liste de
                    célébrités pour l'année, rejoignez un cercle, et grimpez au classement quand le
                    destin vous donne raison.
                </p>

                <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                    <Button asChild size="lg">
                        <Link to="/sign-up/$" params={{ _splat: '' }}>
                            <Zap size={17} /> S'inscrire — c'est gratuit
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link to="/sign-in/$" params={{ _splat: '' }}>
                            Connexion
                        </Link>
                    </Button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-3">
                    <Lock size={14} /> Jeu entre amis · sans argent réel
                </p>

                <div className="mx-auto mt-9 grid max-w-[520px] grid-cols-3 gap-3 lg:max-w-[640px] lg:gap-4">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-[14px] border border-line bg-surface px-1.5 py-3.5 text-center"
                        >
                            <b className="block font-display text-[30px] font-extrabold leading-none tabular-nums text-neon lg:text-[38px]">
                                {stat.value}
                            </b>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
