import { useUser } from '@clerk/clerk-react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AppLoadingGate } from '@/components/auth/AppLoadingGate';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/_app/admin')({
    component: AdminLayout,
});

function AdminLayout() {
    // Previewable dev (no Clerk keys): don't gate, keep the admin UI reachable.
    if (!isClerkConfigured) return <Outlet />;
    return <AdminGate />;
}

/** Gates every /admin route on the Clerk `public_metadata.roles` admin claim. */
function AdminGate() {
    const { isLoaded, user } = useUser();
    if (!isLoaded) return <AppLoadingGate />;

    const roles = (user?.publicMetadata as { roles?: unknown } | undefined)?.roles;
    const isAdmin = Array.isArray(roles) && roles.includes('admin');

    return isAdmin ? <Outlet /> : <AdminForbidden />;
}
