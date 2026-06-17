import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
    Bell,
    Lock,
    Medal,
    Pencil,
    Shield,
    ShieldCheck,
    Skull,
    Star,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AchievementBadge } from '@/components/profile/AchievementBadge';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { LogoutRow } from '@/components/profile/LogoutRow';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { StatTile } from '@/components/profile/StatTile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { initialsOf, monthYearLabel, userDisplayName } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useCircleSummaries, useUserBets } from '@/lib/api/queries';
import { isClerkConfigured } from '@/lib/auth/clerk';
import type { Achievement, PlayerProfile, PlayerStat } from '@/types/profile';

export const Route = createFileRoute('/_app/profile')({
    component: Profile,
});

const fmt = (n: number) => n.toLocaleString('fr-FR');

function Profile() {
    const navigate = useNavigate();
    const { user, isAdmin } = useCurrentUser();
    const betsQuery = useUserBets(user?.id);
    const summariesQuery = useCircleSummaries(user?.id);
    const [editOpen, setEditOpen] = useState(false);

    // Aggregates composed client-side from the user's bets + circle summaries
    // (all-time score/deaths; best rank for the current season).
    const agg = useMemo(() => {
        const bets = betsQuery.data ?? [];
        const score = bets.reduce(
            (acc, bet) => acc + bet.CelebritiesOnBet.reduce((s, c) => s + c.points, 0),
            0,
        );
        const deaths = bets.reduce(
            (acc, bet) => acc + bet.CelebritiesOnBet.filter((c) => c.points > 0).length,
            0,
        );
        const ranks = (summariesQuery.data ?? []).map((s) => s.myRank).filter((r) => r > 0);
        const bestRank = ranks.length ? Math.min(...ranks) : 0;
        const circles = summariesQuery.data?.length ?? 0;
        return { score, deaths, bestRank, circles };
    }, [betsQuery.data, summariesQuery.data]);

    if (!user) {
        return <p className="p-6 text-sm text-ink-3">Chargement de votre profil…</p>;
    }

    const name = userDisplayName(user);
    const profile: PlayerProfile = {
        name,
        handle: user.username ? `@${user.username}` : '',
        initials: initialsOf(name),
        rank: agg.bestRank > 0 ? `#${agg.bestRank}` : '—',
        streak: 0,
        joinedLabel: monthYearLabel(user.clerkCreatedAt),
    };

    const stats: PlayerStat[] = [
        { id: 'score', icon: Zap, value: fmt(agg.score), label: 'Score total' },
        { id: 'circles', icon: Users, value: String(agg.circles), label: 'Cercles' },
        {
            id: 'rank',
            icon: Trophy,
            value: profile.rank,
            label: 'Meilleur rang',
            tone: 'mag',
        },
        {
            id: 'deaths',
            icon: Skull,
            value: String(agg.deaths),
            label: 'Décès marqués',
            tone: 'coral',
        },
    ];

    // Badges derived from real stats; the rest stay locked (no source yet).
    const badges: Achievement[] = [
        {
            id: 'first',
            icon: Skull,
            title: 'Première proie',
            description: '1er pronostic juste',
            tone: 'coral',
            locked: agg.deaths < 1,
        },
        {
            id: 'podium',
            icon: Medal,
            title: 'Sur le podium',
            description: "Top 3 d'un cercle",
            tone: 'mag',
            locked: !(agg.bestRank >= 1 && agg.bestRank <= 3),
        },
        {
            id: 'collector',
            icon: Users,
            title: 'Rassembleur',
            description: 'Membre de 3 cercles',
            locked: agg.circles < 3,
        },
        {
            id: 'oracle',
            icon: Star,
            title: 'Oracle',
            description: '5 décès marqués',
            locked: agg.deaths < 5,
        },
        { id: 'perfect', icon: Lock, title: 'Sans-faute', description: 'Verrouillé', locked: true },
    ];
    const unlocked = badges.filter((b) => !b.locked).length;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <ProfileHeader profile={profile} onEdit={() => setEditOpen(true)} />

            <Button
                variant="outline"
                className="w-full md:hidden"
                onClick={() => setEditOpen(true)}
            >
                <Pencil size={15} /> Modifier le profil
            </Button>

            <div className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
                {/* stats + achievements */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                            Statistiques
                        </span>
                        <span className="text-xs text-ink-3">toutes saisons</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {stats.map((stat) => (
                            <StatTile key={stat.id} {...stat} />
                        ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                            Badges arcade
                        </span>
                        <span className="text-xs text-ink-3">
                            {unlocked} / {badges.length} débloqués
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 md:grid-cols-5">
                        {badges.map((badge) => (
                            <AchievementBadge key={badge.id} {...badge} />
                        ))}
                    </div>
                </div>

                {/* account settings */}
                <div className="flex flex-col gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        Réglages du compte
                    </span>
                    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                        {isAdmin && (
                            <SettingsRow
                                icon={ShieldCheck}
                                title="Administration"
                                description="Gérer le catalogue des célébrités"
                                onClick={() => navigate({ to: '/admin/celebrities' })}
                            />
                        )}
                        <SettingsRow
                            icon={Pencil}
                            title="Pseudo & avatar"
                            description="Modifier votre identité de joueur"
                            onClick={() => setEditOpen(true)}
                        />
                        <SettingsRow
                            icon={Shield}
                            title="Compte & sécurité"
                            description="E-mail, mot de passe, connexion"
                        />
                        <SettingsRow
                            icon={Bell}
                            title="Notifications"
                            description="Décès, classements, invitations"
                            control={<Switch defaultChecked />}
                        />
                        <SettingsRow
                            icon={Lock}
                            title="Confidentialité"
                            description="Profil public, mises visibles"
                        />
                    </div>
                    {isClerkConfigured && (
                        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                            <LogoutRow />
                        </div>
                    )}
                </div>
            </div>

            <EditProfileDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
        </div>
    );
}
