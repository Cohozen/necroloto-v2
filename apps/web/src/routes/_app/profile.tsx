import { createFileRoute } from '@tanstack/react-router';
import {
    Bell,
    Flame,
    Lock,
    LogOut,
    Medal,
    Pencil,
    Shield,
    Skull,
    Star,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { AchievementBadge } from '@/components/profile/AchievementBadge';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { StatTile } from '@/components/profile/StatTile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Achievement, PlayerProfile, PlayerStat } from '@/types/profile';

export const Route = createFileRoute('/_app/profile')({
    component: Profile,
});

// TEMP mock data — replaced by the API (lib/api + TanStack Query) in the data step.
const ME: PlayerProfile = {
    name: 'Camille Voss',
    handle: '@croque_mort',
    initials: 'CV',
    rank: '#2',
    streak: 3,
    joinedLabel: 'déc. 2024',
};

const STATS: PlayerStat[] = [
    { id: 'score', icon: Zap, value: '1 630', label: 'Score total', chip: '+185' },
    { id: 'circles', icon: Users, value: '4', label: 'Cercles' },
    { id: 'rank', icon: Trophy, value: '#2', label: 'Meilleur rang', tone: 'mag' },
    { id: 'deaths', icon: Skull, value: '9', label: 'Décès marqués', tone: 'coral' },
];

const BADGES: Achievement[] = [
    { id: 'streak', icon: Flame, title: 'Série de 3', description: "3 saisons d'affilée" },
    {
        id: 'podium',
        icon: Medal,
        title: 'Sur le podium',
        description: "Top 3 d'un cercle",
        tone: 'mag',
    },
    {
        id: 'first',
        icon: Skull,
        title: 'Première proie',
        description: '1er pronostic juste',
        tone: 'coral',
    },
    { id: 'oracle', icon: Star, title: 'Oracle', description: '5 décès marqués' },
    { id: 'perfect', icon: Lock, title: 'Sans-faute', description: 'Verrouillé', locked: true },
];

function Profile() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <ProfileHeader profile={ME} />

            <Button variant="outline" className="w-full md:hidden">
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
                        {STATS.map((stat) => (
                            <StatTile key={stat.id} {...stat} />
                        ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                            Badges arcade
                        </span>
                        <span className="text-xs text-ink-3">4 / 5 débloqués</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 md:grid-cols-5">
                        {BADGES.map((badge) => (
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
                        <SettingsRow
                            icon={Pencil}
                            title="Pseudo & avatar"
                            description="Modifier votre identité de joueur"
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
                    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                        <SettingsRow icon={LogOut} title="Déconnexion" danger />
                    </div>
                </div>
            </div>
        </div>
    );
}
