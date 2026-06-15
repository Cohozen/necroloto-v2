import { createFileRoute } from '@tanstack/react-router';
import { Check, Eye, Globe, Lock, Ticket, Users, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { ChoiceCard } from '@/components/circles/ChoiceCard';
import { CircleAdminHeader } from '@/components/circles/CircleAdminHeader';
import { DangerZone } from '@/components/circles/DangerZone';
import { InviteCodeBox } from '@/components/circles/InviteCodeBox';
import { SettingToggleRow } from '@/components/circles/SettingToggleRow';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/circles/$id/settings')({
    component: CircleSettings,
});

const YEAR = new Date().getFullYear();

// TEMP mock data — replaced by the API (circle + membership) in the data step.
const CIRCLE = { name: 'Les Faucheurs du Dimanche', members: 8, isCreator: true };

function CircleSettings() {
    const { id } = Route.useParams();
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    return (
        <div className="mx-auto flex w-full max-w-[620px] flex-col gap-5 p-4 md:p-6">
            <CircleAdminHeader
                id={id}
                name={CIRCLE.name}
                visibility="PRIVATE"
                members={CIRCLE.members}
                active="settings"
            />

            <div className="relative flex flex-col gap-[22px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-6 md:p-7">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

                {/* name */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2.5">
                        <span className="text-[13px] font-semibold text-ink-2">Nom du cercle</span>
                        <span className="font-mono text-[11px] text-ink-3">24 / 30</span>
                    </div>
                    <div className="flex h-[50px] items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 px-3.5 transition-colors focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30">
                        <Users size={18} className="shrink-0 text-ink-3" />
                        <input
                            defaultValue={CIRCLE.name}
                            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
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
                        Réglages de la saison <span className="text-ink-3">{YEAR}</span>
                    </span>
                    <SettingToggleRow
                        icon={Ticket}
                        title="Autoriser de nouveaux paris"
                        description="Les membres peuvent rejoindre en cours d'année"
                        defaultChecked
                    />
                    <SettingToggleRow
                        icon={WalletCards}
                        title="Liste modifiable"
                        description="Modifier sa sélection jusqu'au 31 déc."
                        defaultChecked
                    />
                    <SettingToggleRow
                        icon={Eye}
                        title="Mises visibles"
                        description="Chacun voit sur qui les autres ont parié"
                    />
                </div>

                <InviteCodeBox code="NEC–7F3" />

                <Button size="lg" className="min-w-[190px] self-start">
                    <Check size={16} strokeWidth={2.4} /> Enregistrer
                </Button>
            </div>

            <DangerZone name={CIRCLE.name} members={CIRCLE.members} isCreator={CIRCLE.isCreator} />
        </div>
    );
}
