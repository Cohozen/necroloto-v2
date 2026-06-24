import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
    CalendarRange,
    ChevronLeft,
    Eye,
    Globe,
    Lock,
    Ticket,
    Users,
    WalletCards,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { ChoiceCard } from '@/components/circles/ChoiceCard';
import { SettingToggleRow } from '@/components/circles/SettingToggleRow';
import { Button } from '@/components/ui/button';
import { seasonStatus } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useActiveSeason, useCreateCircle } from '@/lib/api/queries';
import { SEASON_STATUS_LABEL } from '@/types/season';

export const Route = createFileRoute('/_app/circles/new')({
    component: CreateCircle,
});

const MAX_NAME = 30;

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

function CreateCircle() {
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const createCircle = useCreateCircle();
    const { data: activeSeason } = useActiveSeason();

    const [name, setName] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');
    const [allowNewBet, setAllowNewBet] = useState(true);
    const [allowEdit, setAllowEdit] = useState(false);
    const [betsVisible, setBetsVisible] = useState(true);

    // The "rallonge" (allowEdit) only matters once bets are closed — during the
    // open betting window everyone edits freely, so the toggle is locked then.
    const betsOpen = activeSeason ? seasonStatus(activeSeason) === 'bets-open' : false;

    const trimmedName = name.trim();
    const canSubmit = !!user && trimmedName.length > 0 && !createCircle.isPending;

    const handleSubmit = () => {
        if (!canSubmit || !user) return;
        createCircle.mutate(
            {
                name: trimmedName,
                visibility: visibility === 'private' ? 'PRIVATE' : 'PUBLIC',
                allowNewBet,
                allowEdit: betsOpen ? false : allowEdit,
                betsVisible,
                creatorUserId: user.id,
            },
            {
                onSuccess: (circle) => {
                    navigate({ to: '/circles/$id', params: { id: circle.id } });
                },
            },
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6 p-4 md:p-6">
            <Link
                to="/circles"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
            >
                <ChevronLeft size={16} /> Mes cercles
            </Link>

            <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                    Créer un cercle
                </div>
                <h1 className="mt-2 font-display text-[42px] font-extrabold leading-none">
                    Montez votre cercle
                </h1>
                <p className="mx-auto mt-2 max-w-[42ch] text-[14.5px] text-ink-2">
                    Donnez-lui un nom, choisissez qui peut entrer, et lancez la saison.
                </p>
            </div>

            <div className="relative flex flex-col gap-[22px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-6 md:p-7">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

                {/* name */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[13px] font-semibold text-ink-2">Nom du cercle</span>
                        <span className="font-mono text-[11px] text-ink-3">
                            {name.length} / {MAX_NAME}
                        </span>
                    </div>
                    <div className="flex h-[50px] items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 px-3.5 transition-colors focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30">
                        <Users size={18} className="shrink-0 text-ink-3" />
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                            placeholder="Nom du cercle"
                            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                        />
                    </div>
                    <p className="text-xs text-ink-3">
                        Visible par tous les membres. Changez-le quand vous voulez.
                    </p>
                </div>

                {/* visibility */}
                <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-ink-2">Visibilité</span>
                    <div className="grid grid-cols-2 gap-2.5">
                        <ChoiceCard
                            icon={Lock}
                            title="Privé"
                            description="Sur invitation, via un code partagé"
                            selected={visibility === 'private'}
                            onSelect={() => setVisibility('private')}
                        />
                        <ChoiceCard
                            icon={Globe}
                            title="Public"
                            description="Visible et rejoignable par tous"
                            selected={visibility === 'public'}
                            onSelect={() => setVisibility('public')}
                        />
                    </div>
                </div>

                {/* season settings */}
                <div className="flex flex-col gap-2.5">
                    <span className="text-[13px] font-semibold text-ink-2">
                        Réglages de la saison
                    </span>

                    {activeSeason && (
                        <div className="flex flex-col gap-2 rounded-[13px] border border-line bg-surface-2 p-3.5">
                            <div className="flex items-center justify-between gap-2.5">
                                <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-2">
                                    <CalendarRange size={16} className="text-neon" />
                                    Saison {activeSeason.year}
                                </span>
                                <span className="rounded-full border border-neon/30 bg-neon/10 px-2.5 py-0.5 text-[11px] font-semibold text-neon">
                                    {SEASON_STATUS_LABEL[seasonStatus(activeSeason)]}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-xs text-ink-3">
                                <span>
                                    Paris : {fmtDate(activeSeason.betStartDate)} →{' '}
                                    {fmtDate(activeSeason.betEndDate)}
                                </span>
                                <span>
                                    Saison : {fmtDate(activeSeason.openDate)} →{' '}
                                    {fmtDate(activeSeason.closeDate)}
                                </span>
                            </div>
                        </div>
                    )}

                    <SettingToggleRow
                        icon={Ticket}
                        title="Autoriser de nouveaux paris"
                        description="Les membres peuvent rejoindre en cours d'année"
                        checked={allowNewBet}
                        onCheckedChange={setAllowNewBet}
                    />
                    <SettingToggleRow
                        icon={WalletCards}
                        title="Liste modifiable"
                        description="Laisse modifier sa sélection une fois les paris fermés, jusqu'à la fin de saison"
                        checked={betsOpen ? false : allowEdit}
                        onCheckedChange={setAllowEdit}
                        disabled={betsOpen}
                        hint={betsOpen ? 'Réglable une fois les paris fermés' : undefined}
                    />
                    <SettingToggleRow
                        icon={Eye}
                        title="Mises visibles"
                        description="Chacun voit sur qui les autres ont parié"
                        checked={betsVisible}
                        onCheckedChange={setBetsVisible}
                    />
                </div>

                {createCircle.isError && (
                    <p className="text-[13px] text-coral">
                        La création a échoué. Vérifiez votre connexion et réessayez.
                    </p>
                )}

                <Button
                    size="lg"
                    className="mt-0.5 w-full"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                >
                    <Zap size={17} /> {createCircle.isPending ? 'Création…' : 'Créer le cercle'}
                </Button>
            </div>
        </div>
    );
}
