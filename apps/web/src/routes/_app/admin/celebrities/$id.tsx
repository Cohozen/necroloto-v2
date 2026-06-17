import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CelebrityForm } from '@/components/admin/CelebrityForm';
import {
    useCelebrity,
    useDeleteCelebrity,
    useEnrichCelebrity,
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

    const handleSave = (payload: CreateCelebrityPayload) => {
        updateCelebrity.mutate(payload);
    };

    const handleDelete = () => {
        deleteCelebrity.mutate(id, {
            onSuccess: () => navigate({ to: '/admin/celebrities' }),
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Éditer" />
            {isLoading ? (
                <p className="py-12 text-center text-sm text-ink-3">Chargement de la fiche…</p>
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
                    isSaving={updateCelebrity.isPending}
                    isDeleting={deleteCelebrity.isPending}
                    isEnriching={enrichCelebrity.isPending}
                    saveError={updateCelebrity.isError}
                />
            )}
        </div>
    );
}
