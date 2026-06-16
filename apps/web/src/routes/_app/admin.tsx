import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { useCurrentUser } from '@/lib/api/currentUser';

export const Route = createFileRoute('/_app/admin')({
    component: AdminLayout,
});

/**
 * Gates every /admin route on the global admin role (Clerk `public_metadata.roles`,
 * resolved by CurrentUserProvider — mirrors the API AdminGuard). Non-admins get the
 * AdminForbidden screen. In previewable dev (no Clerk) `isAdmin` is true.
 */
function AdminLayout() {
    const { isAdmin } = useCurrentUser();
    return isAdmin ? <Outlet /> : <AdminForbidden />;
}
