import { createFileRoute } from '@tanstack/react-router';
import { PagePlaceholder } from '@/components/PagePlaceholder';

export const Route = createFileRoute('/_app/celebrities')({
    component: Celebrities,
});

function Celebrities() {
    return (
        <PagePlaceholder
            eyebrow="Mon pari"
            title="Catalogue"
            description="Recherche de célébrités et composition de votre pari. Écran à venir (Phase 4)."
        />
    );
}
