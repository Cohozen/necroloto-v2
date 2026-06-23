import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Check, Eye, Globe, Lock, Ticket, Users, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChoiceCard } from '@/components/circles/ChoiceCard';
import { CircleAdminHeader } from '@/components/circles/CircleAdminHeader';
import { DangerZone } from '@/components/circles/DangerZone';
import { InviteCodeBox } from '@/components/circles/InviteCodeBox';
import { SettingToggleRow } from '@/components/circles/SettingToggleRow';
import { PageLoader } from '@/components/feedback/PageLoader';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/api/currentUser';
import {
    useCircleDetail,
    useDeleteCircle,
    useLeaveCircle,
    useUpdateCircle,
} from '@/lib/api/queries';
import type { ApiCircle } from '@/lib/api/types';

export const Route = createFileRoute('/_app/circles/$id/settings')({
    component: CircleSettings,
});

const YEAR = new Date().getFullYear();
const MAX_NAME = 30;

function CircleSettings() {
    const { id } = Route.useParams();
    const circleQuery = useCircleDetail(id);
    const circle = circleQuery.data;

    if (circleQuery.isLoading) {
        return <PageLoader label="Chargement des réglages…" />;
    }
    if (!circle) {
        return <p className="p-6 text-sm text-coral">Cercle introuvable.</p>;
    }

    return <SettingsForm circle={circle} />;
}

/** Earliest-joined ADMIN, used as the circle creator (no creator field in DB). */
function creatorUserId(circle: ApiCircle): string | undefined {
    const admins = (circle.memberships ?? [])
        .filter((m) => m.role === 'ADMIN')
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    return admins[0]?.userId;
}

function SettingsForm({ circle }: { circle: ApiCircle }) {
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const updateCircle = useUpdateCircle(circle.id);
    const deleteCircle = useDeleteCircle();
    const leaveCircle = useLeaveCircle();

    const [name, setName] = useState(circle.name);
    const [visibility, setVisibility] = useState<'private' | 'public'>(
        circle.visibility === 'PUBLIC' ? 'public' : 'private',
    );
    const [allowNewBet, setAllowNewBet] = useState(circle.allowNewBet);
    const [allowEdit, setAllowEdit] = useState(circle.allowEdit);
    const [betsVisible, setBetsVisible] = useState(circle.betsVisible);

    const members = circle.memberships?.length ?? 0;
    const myMembership = circle.memberships?.find((m) => m.userId === user?.id);
    const isCreator = !!user && creatorUserId(circle) === user.id;
    const adminCount = circle.memberships?.filter((m) => m.role === 'ADMIN').length ?? 0;
    const isSoleAdmin = myMembership?.role === 'ADMIN' && adminCount === 1;

    const trimmedName = name.trim();
    const canSubmit = trimmedName.length > 0 && !updateCircle.isPending;

    const handleSave = () => {
        if (!canSubmit) return;
        updateCircle.mutate({
            name: trimmedName,
            visibility: visibility === 'private' ? 'PRIVATE' : 'PUBLIC',
            allowNewBet,
            allowEdit,
            betsVisible,
        });
    };

    const handleLeave = () => {
        if (!myMembership || isSoleAdmin) return;
        leaveCircle.mutate(myMembership.id, {
            onSuccess: () => navigate({ to: '/circles' }),
            onError: () => toast.error('Impossible de quitter le cercle. Réessayez plus tard.'),
        });
    };

    const handleDelete = () => {
        deleteCircle.mutate(circle.id, {
            onSuccess: () => navigate({ to: '/circles' }),
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <CircleAdminHeader
                id={circle.id}
                name={circle.name}
                visibility={circle.visibility}
                members={members}
                active="settings"
            />

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
                        checked={allowNewBet}
                        onCheckedChange={setAllowNewBet}
                    />
                    <SettingToggleRow
                        icon={WalletCards}
                        title="Liste modifiable"
                        description="Laisse modifier sa sélection une fois les paris fermés, jusqu'à la fin de saison"
                        checked={allowEdit}
                        onCheckedChange={setAllowEdit}
                    />
                    {allowEdit && (
                        <p className="flex items-start gap-1.5 px-1 text-xs text-coral">
                            <AlertTriangle size={13} className="mt-0.5 shrink-0" />À utiliser avec
                            précaution : à n'activer que pour dépanner un membre qui n'a pas pu
                            finir son pari à temps. Pendant la période de paris, chacun peut déjà
                            modifier librement sa sélection.
                        </p>
                    )}
                    <SettingToggleRow
                        icon={Eye}
                        title="Mises visibles"
                        description="Chacun voit sur qui les autres ont parié, une fois la saison ouverte (les paris restent secrets pendant la période de paris)"
                        checked={betsVisible}
                        onCheckedChange={setBetsVisible}
                    />
                </div>

                {circle.code && <InviteCodeBox code={circle.code} />}

                {updateCircle.isError && (
                    <p className="text-[13px] text-coral">
                        L'enregistrement a échoué. Vérifiez votre connexion et réessayez.
                    </p>
                )}

                <Button
                    size="lg"
                    className="min-w-[190px] self-start"
                    disabled={!canSubmit}
                    onClick={handleSave}
                >
                    <Check size={16} strokeWidth={2.4} />{' '}
                    {updateCircle.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
            </div>

            <DangerZone
                name={circle.name}
                members={members}
                isCreator={isCreator}
                soleAdmin={isSoleAdmin}
                onLeave={handleLeave}
                onDelete={handleDelete}
                leaving={leaveCircle.isPending}
                deleting={deleteCircle.isPending}
            />
        </div>
    );
}
