import { createFileRoute } from '@tanstack/react-router';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CelebrityForm } from '@/components/admin/CelebrityForm';
import type { CelebrityFormData } from '@/types/admin';

export const Route = createFileRoute('/_app/admin/celebrities/$id')({
    component: AdminEditCelebrity,
});

// TEMP mock data — replaced by the API (fetch by id) in the data step.
const CELEB: CelebrityFormData = {
    id: 'gloria',
    name: 'Dame Gloria Ravensworth',
    bornLabel: '12 février 1929',
    bornYear: 1929,
    wikidataQid: 'Q462359',
    deceased: true,
    deathLabel: '14 mars 2026',
    points: 140,
    bettors: 3,
};

function AdminEditCelebrity() {
    return (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Éditer" />
            <CelebrityForm mode="edit" celeb={CELEB} />
        </div>
    );
}
