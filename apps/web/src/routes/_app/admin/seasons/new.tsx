import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SeasonForm } from '@/components/admin/SeasonForm';
import { ApiError } from '@/lib/api/client';
import { useCreateSeason } from '@/lib/api/queries';
import type { CreateSeasonPayload } from '@/lib/api/types';

export const Route = createFileRoute('/_app/admin/seasons/new')({
    component: AdminCreateSeason,
});

function AdminCreateSeason() {
    const navigate = useNavigate();
    const createSeason = useCreateSeason();

    const handleSave = (payload: CreateSeasonPayload) => {
        createSeason.mutate(payload, {
            onSuccess: (season) => {
                toast.success(`Saison ${season.year} créée.`);
                navigate({ to: '/admin/seasons/$id', params: { id: season.id } });
            },
            onError: () => toast.error('La création de la saison a échoué.'),
        });
    };

    const saveError = createSeason.error instanceof ApiError ? createSeason.error.message : null;

    return (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 p-4 md:p-6">
            <AdminHeader section="Saisons" crumb="Nouvelle" />
            <SeasonForm
                mode="create"
                onSave={handleSave}
                isSaving={createSeason.isPending}
                saveError={saveError}
            />
        </div>
    );
}
