import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '@/components/PagePlaceholder';

export const Route = createFileRoute('/_app/profile')({
    component: Profile,
});

function Profile() {
    return (
        <PagePlaceholder
            eyebrow="Profil"
            title="Profil"
            description="Avatar, stats joueur et réglages du compte. Écran à venir (Phase 4)."
        />
    );
}
