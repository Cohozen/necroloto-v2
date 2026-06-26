import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CelebrityForm } from '@/components/admin/CelebrityForm';
import { PageLoader } from '@/components/feedback/PageLoader';
import {
    useCelebrity,
    useDeleteCelebrity,
    useEnrichCelebrity,
    useUnlinkWikidata,
    useUpdateCelebrity,
} from '@/lib/api/queries';
import type { CreateCelebrityPayload } from '@/lib/api/types';

export const Route = createFileRoute('/_app/admin/celebrities/$id')({
    component: AdminEditCelebrity,
});

function AdminEditCelebrity() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const { data: celebrity, isLoading, isError } = useCelebrity(id);
    const updateCelebrity = useUpdateCelebrity(id);
    const deleteCelebrity = useDeleteCelebrity();
    const enrichCelebrity = useEnrichCelebrity();
    const unlinkWikidata = useUnlinkWikidata(id);

    const handleSave = (payload: CreateCelebrityPayload) => {
        updateCelebrity.mutate(payload);
    };

    const handleDelete = () => {
        deleteCelebrity.mutate(id, {
            onSuccess: () => navigate({ to: '/admin/celebrities' }),
        });
    };

    const handleSyncPhoto = () => {
        enrichCelebrity.mutate(
            { id, photoOnly: true },
            {
                onSuccess: () => toast.success('Photo synchronisée depuis Wikidata.'),
                onError: (err) =>
                    toast.error(err.message || 'La synchronisation de la photo a échoué.'),
            },
        );
    };

    const handleSyncAll = () => {
        enrichCelebrity.mutate(
            { id, forcePhoto: true },
            {
                onSuccess: () => toast.success('Fiche synchronisée depuis Wikidata.'),
                onError: (err) => toast.error(err.message || 'La synchronisation a échoué.'),
            },
        );
    };

    const handleUnlinkWikidata = () => {
        unlinkWikidata.mutate(undefined, {
            onSuccess: () => toast.success('Source Wikidata retirée.'),
            onError: (err) => toast.error(err.message || 'Le retrait de la source a échoué.'),
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Éditer" />
            {isLoading ? (
                <PageLoader label="Chargement de la fiche…" />
            ) : isError || !celebrity ? (
                <p className="py-12 text-center text-sm text-coral">Cette fiche est introuvable.</p>
            ) : (
                <CelebrityForm
                    mode="edit"
                    celebrity={celebrity}
                    bettors={celebrity.CelebritiesOnBet.length}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onEnrich={(wikidataId) => enrichCelebrity.mutate({ id, wikidataId })}
                    onSyncPhoto={handleSyncPhoto}
                    onSyncAll={handleSyncAll}
                    onUnlinkWikidata={handleUnlinkWikidata}
                    isSaving={updateCelebrity.isPending}
                    isDeleting={deleteCelebrity.isPending}
                    isEnriching={enrichCelebrity.isPending || unlinkWikidata.isPending}
                    saveError={updateCelebrity.isError}
                />
            )}
        </div>
    );
}
