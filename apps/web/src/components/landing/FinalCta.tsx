import { Link } from '@tanstack/react-router';
import { Ghost, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Closing call-to-action band. */
export function FinalCta() {
    return (
        <section id="join" className="px-5 pb-14 pt-6">
            <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[24px] border border-neon/30 px-6 py-11 text-center shadow-[0_0_calc(var(--glow)*50px)_rgb(var(--neon-rgb)/calc(var(--glow)*0.2))] [background:radial-gradient(120%_130%_at_50%_-30%,rgb(var(--neon-rgb)/0.16),transparent_60%),linear-gradient(180deg,var(--color-surface-2),var(--color-surface))]">
                <Ghost
                    size={64}
                    className="pointer-events-none absolute left-[4%] top-[30%] text-neon/15"
                />
                <Ghost
                    size={64}
                    className="pointer-events-none absolute bottom-[14%] right-[4%] text-magenta/15"
                />
                <h2 className="relative font-display text-[clamp(28px,8vw,52px)] font-extrabold leading-none tracking-[-0.01em]">
                    Prêt à narguer la Faucheuse ?
                </h2>
                <p className="relative mx-auto mb-6 mt-3.5 max-w-[38ch] text-[15px] text-ink-2">
                    Rejoignez un cercle en 30 secondes et lancez votre pronostic pour la saison
                    2026. Gratuit, fun, et terriblement compétitif.
                </p>
                <div className="relative flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg" className="w-full max-w-[320px] sm:w-auto">
                        <Link to="/sign-up/$" params={{ _splat: '' }}>
                            <Zap size={17} /> S'inscrire maintenant
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full max-w-[320px] sm:w-auto"
                    >
                        <Link to="/sign-in/$" params={{ _splat: '' }}>
                            J'ai déjà un compte
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
