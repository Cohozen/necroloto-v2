import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '@/components/PagePlaceholder';

export const Route = createFileRoute('/_app/dashboard')({
    component: Dashboard,
});

function Dashboard() {
    return (
        <PagePlaceholder
            eyebrow="Accueil"
            title="Cockpit"
            description="Score global, cercles, décès récents et pari en cours. Écran à venir (Phase 4)."
        />
    );
}
