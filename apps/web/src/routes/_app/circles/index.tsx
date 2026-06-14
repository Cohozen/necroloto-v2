import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '@/components/PagePlaceholder';

export const Route = createFileRoute('/_app/circles/')({
    component: Circles,
});

function Circles() {
    return (
        <PagePlaceholder
            eyebrow="Classement"
            title="Cercles"
            description="Vos cercles et leurs classements. Hub à venir (Phase 4)."
        />
    );
}
