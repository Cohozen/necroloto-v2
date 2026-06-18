import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SeasonForm } from '@/components/admin/SeasonForm';
import { ApiError } from '@/lib/api/client';
import { useDeleteSeason, useSeason, useUpdateSeason } from '@/lib/api/queries';
import type { CreateSeasonPayload } from '@/lib/api/types';

export const Route = createFileRoute('/_app/admin/seasons/$id')({
    component: AdminEditSeason,
});

function AdminEditSeason() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const { data: season, isLoading, isError } = useSeason(id);
    const updateSeason = useUpdateSeason(id);
    const deleteSeason = useDeleteSeason();

    const handleSave = (payload: CreateSeasonPayload) => {
        updateSeason.mutate(payload, {
            onSuccess: () => toast.success('Saison mise à jour.'),
            onError: () => toast.error('La mise à jour a échoué.'),
        });
    };

    const handleDelete = () => {
        deleteSeason.mutate(id, {
            onSuccess: () => {
                toast.success('Saison supprimée.');
                navigate({ to: '/admin/seasons' });
            },
            onError: () => toast.error('La suppression a échoué.'),
        });
    };

    const saveError = updateSeason.error instanceof ApiError ? updateSeason.error.message : null;

    return (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 p-4 md:p-6">
            <AdminHeader section="Saisons" crumb="Éditer" />
            {isLoading ? (
                <p className="py-12 text-center text-sm text-ink-3">Chargement de la saison…</p>
            ) : isError || !season ? (
                <p className="py-12 text-center text-sm text-coral">
                    Cette saison est introuvable.
                </p>
            ) : (
                <SeasonForm
                    mode="edit"
                    season={season}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    isSaving={updateSeason.isPending}
                    isDeleting={deleteSeason.isPending}
                    saveError={saveError}
                />
            )}
        </div>
    );
}
