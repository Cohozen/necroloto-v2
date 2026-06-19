import { Calendar, Skull, User, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';

const PILLS = [
    { icon: Zap, label: '100% gratuit' },
    { icon: User, label: 'Entre potes' },
    { icon: Calendar, label: 'Saison 2026' },
];

interface AuthLayoutProps {
    /** A custom auth form (SignInForm / SignUpForm / ForgotPasswordForm). */
    children: ReactNode;
}

/**
 * Marketing split shell around the custom auth forms: a brand panel on the left
 * (desktop) and the themed card on the right. Mobile shows just the logo + card.
 * Ported from docs/mockups/screens/auth.js (authSplitDesktop / authMob).
 */
export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-dvh">
            {/* brand panel — desktop only */}
            <aside className="relative hidden flex-[1.04] flex-col justify-between overflow-hidden p-14 lg:flex">
                <Skull
                    size={120}
                    strokeWidth={1.2}
                    className="pointer-events-none absolute left-[38%] top-[18%] text-coral/10"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 -right-10 opacity-[0.16] drop-shadow-[0_0_40px_rgb(var(--neon-rgb)/0.6)]"
                >
                    <Logo cell={26} />
                </div>

                <Logo cell={4} withWord />

                <div className="relative z-[1] flex max-w-[520px] flex-col gap-5">
                    <span className="inline-flex w-fit items-center rounded-full border border-neon/40 bg-neon/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.04em] text-neon">
                        Le lotomacabre entre potes · Saison 2026
                    </span>
                    <h1 className="font-display text-[clamp(56px,7vw,84px)] font-extrabold leading-[0.9] tracking-[0.01em] text-glow-neon">
                        Défiez
                        <br />
                        le destin
                    </h1>
                    <p className="max-w-[44ch] text-[17px] leading-relaxed text-ink-2">
                        Pariez sur les célébrités que vous pensez voir partir cette année. Marquez
                        des points quand le destin vous donne raison. Le plus macabre des jeux entre
                        amis.
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {PILLS.map((pill) => (
                            <span
                                key={pill.label}
                                className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2"
                            >
                                <pill.icon size={14} /> {pill.label}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-[1] text-[12.5px] text-ink-3">
                    Jeu parodique · majeurs uniquement
                </p>
            </aside>

            {/* auth card */}
            <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 lg:border-l lg:border-line lg:bg-bg/35">
                <div className="lg:hidden">
                    <Logo cell={4} withWord />
                </div>
                <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-8 shadow-glow-soft">
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />
                    {children}
                </div>
            </div>
        </div>
    );
}
