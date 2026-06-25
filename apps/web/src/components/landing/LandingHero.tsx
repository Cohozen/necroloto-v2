import { Link } from '@tanstack/react-router';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Hero — arcade wordmark, headline and primary CTAs. */
export function LandingHero() {
    return (
        <section
            id="top"
            className="relative px-5 pb-16 pt-14 text-center lg:pb-[88px] lg:pt-[88px]"
        >
            <div className="mx-auto w-full max-w-[1180px]">
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
                        <Link to="/sign-up">
                            <Zap size={17} /> S'inscrire — c'est gratuit
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link to="/sign-in">Connexion</Link>
                    </Button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-3">
                    <Lock size={14} /> Jeu entre amis · sans argent réel
                </p>
            </div>
        </section>
    );
}
