import { Flame, Globe, LayoutGrid, Search, User, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StepCard } from './StepCard';

/** "Comment ça marche" — three steps from cercle to points. */
export function HowItWorks() {
    return (
        <section id="how" className="px-5 py-14">
            <div className="mx-auto w-full max-w-[1180px]">
                <div className="mb-9 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                        Comment ça marche
                    </span>
                    <h2 className="mt-3 font-display text-[clamp(28px,7vw,46px)] font-extrabold leading-none tracking-[-0.01em]">
                        Trois étapes, zéro pitié
                    </h2>
                    <p className="mx-auto mt-3 max-w-[46ch] text-[15px] text-ink-2">
                        Pas besoin de boule de cristal — juste d'un peu de flair et d'un bon cercle
                        de potes.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 md:gap-[18px]">
                    <StepCard
                        n="01"
                        icon={User}
                        title="Rejoignez un cercle"
                        body="Créez un cercle privé avec vos amis ou plongez dans un cercle public. Chaque cercle a son classement et sa rivalité."
                        tone="neon"
                        tag={
                            <Badge variant="secondary" className="gap-1.5">
                                <Globe size={13} /> Privé ou public
                            </Badge>
                        }
                    />
                    <StepCard
                        n="02"
                        icon={LayoutGrid}
                        title="Composez votre pari"
                        body="Draftez jusqu'à 50 célébrités pour l'année via la recherche. Plus la cote est haute, plus le pari rapporte gros."
                        tone="mag"
                        tag={
                            <Badge variant="secondary" className="gap-1.5">
                                <Search size={13} /> 50 célébrités max
                            </Badge>
                        }
                    />
                    <StepCard
                        n="03"
                        icon={Zap}
                        title="Marquez des points"
                        body="Quand le destin frappe, vos pronostics se réalisent et vous engrangez les points. Séries, badges, et la première place vous attendent."
                        tone="coral"
                        tag={
                            <Badge variant="streak" className="gap-1.5">
                                <Flame size={13} /> Séries & badges
                            </Badge>
                        }
                    />
                </div>
            </div>
        </section>
    );
}
