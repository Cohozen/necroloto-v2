import { createFileRoute } from '@tanstack/react-router';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CelebrityForm } from '@/components/admin/CelebrityForm';

export const Route = createFileRoute('/_app/admin/celebrities/new')({
    component: AdminCreateCelebrity,
});

function AdminCreateCelebrity() {
    return (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 p-4 md:p-6">
            <AdminHeader crumb="Nouvelle" />
            <CelebrityForm mode="create" />
        </div>
    );
}
