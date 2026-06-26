import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CelebrityForm } from '@/components/admin/CelebrityForm';
import { useCreateCelebrity, useEnrichCelebrity } from '@/lib/api/queries';
import type { CreateCelebrityPayload } from '@/lib/api/types';

export const Route = createFileRoute('/_app/admin/celebrities/new')({
    component: AdminCreateCelebrity,
});

function AdminCreateCelebrity() {
    const navigate = useNavigate();
    const createCelebrity = useCreateCelebrity();
    const enrichCelebrity = useEnrichCelebrity();
    // Set by the Wikidata picker in create mode: enriched right after creation.
    const [pickedWikidataId, setPickedWikidataId] = useState<string | undefined>(undefined);

    const handleSave = (payload: CreateCelebrityPayload) => {
        createCelebrity.mutate(payload, {
            onSuccess: async (created) => {
                if (pickedWikidataId) {
                    await enrichCelebrity
                        .mutateAsync({ id: created.id, wikidataId: pickedWikidataId })
                        .catch(() => undefined);
                }
                navigate({ to: '/admin/celebrities/$id', params: { id: created.id } });
            },
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Nouvelle" />
            <CelebrityForm
                mode="create"
                onSave={handleSave}
                onEnrich={setPickedWikidataId}
                isSaving={createCelebrity.isPending || enrichCelebrity.isPending}
                saveError={createCelebrity.isError}
            />
        </div>
    );
}
