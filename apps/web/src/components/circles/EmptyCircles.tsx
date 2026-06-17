import { Link } from '@tanstack/react-router';
import { Bolt, Globe, Hash, Lock, Plus } from 'lucide-react';
import { EmptyArt } from '@/components/EmptyArt';
import { Button } from '@/components/ui/button';

const PERKS = [
    { icon: Lock, label: 'Privé entre amis' },
    { icon: Globe, label: 'Ou cercles publics' },
    { icon: Bolt, label: 'Gratuit' },
];

/** Empty state for the hub — invite to create or join a first circle. */
export function EmptyCircles() {
    return (
        <div className="flex flex-1 items-center justify-center py-10">
            <div className="flex w-full max-w-[520px] flex-col items-center gap-[18px] text-center">
                <EmptyArt />
                <div>
                    <h2 className="font-display text-[clamp(25px,5vw,30px)] font-extrabold">
                        Aucun cercle… pour l'instant
                    </h2>
                    <p className="mx-auto mt-2.5 max-w-[42ch] text-pretty text-[15px] text-ink-2">
                        Un cercle, c'est votre bande de pronostiqueurs. Créez le vôtre et invitez
                        vos potes, ou rejoignez-en un avec le code qu'on vous a filé.
                    </p>
                </div>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg">
                        <Link to="/circles/new">
                            <Plus size={17} strokeWidth={2.2} /> Créer un cercle
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link to="/circles/join">
                            <Hash size={17} /> Rejoindre via code
                        </Link>
                    </Button>
                </div>
                <Link
                    to="/circles/join"
                    className="mt-2 flex h-[50px] w-full max-w-[360px] items-center gap-2.5 rounded-[13px] border border-line-2 bg-surface pl-4 pr-1.5 text-ink-3 transition-colors hover:border-neon/40"
                >
                    <Hash size={18} />
                    <span className="flex flex-1 gap-[7px] font-mono text-[19px] tracking-[0.3em]">
                        <b className="text-neon">N</b>
                        <b className="text-neon">E</b>
                        <b className="text-neon">C</b>•••
                    </span>
                    <span className="inline-flex h-[34px] items-center rounded-[9px] bg-surface-3 px-3 text-[13px] font-semibold text-ink">
                        Rejoindre
                    </span>
                </Link>
                <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] text-ink-3">
                    {PERKS.map((perk) => (
                        <span key={perk.label} className="flex items-center gap-1.5">
                            <perk.icon size={14} /> {perk.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
