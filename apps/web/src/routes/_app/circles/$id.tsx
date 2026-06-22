import { createFileRoute, Outlet } from '@tanstack/react-router';

/**
 * `year` is validated at the circle layout (a common ancestor of every tab), so the
 * selected season persists in the URL across tabs (Classement/Paris/…) and survives
 * back-navigation and refresh. Children read/write it via this route's search.
 */
export const Route = createFileRoute('/_app/circles/$id')({
    validateSearch: (search: Record<string, unknown>): { year?: number } => {
        const year = Number(search.year);
        return Number.isInteger(year) && year > 0 ? { year } : {};
    },
    component: CircleLayout,
});

/** Circle layout — child tabs (Classement / Membres / Réglages) render here. */
function CircleLayout() {
    return <Outlet />;
}
