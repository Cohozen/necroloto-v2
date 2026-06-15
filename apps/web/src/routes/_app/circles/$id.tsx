import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/circles/$id')({
    component: CircleLayout,
});

/** Circle layout — child tabs (Classement / Membres / Réglages) render here. */
function CircleLayout() {
    return <Outlet />;
}
