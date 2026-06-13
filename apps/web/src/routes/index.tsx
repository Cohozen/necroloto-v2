import { createFileRoute, redirect } from '@tanstack/react-router';

// Landing page lands in Phase 4. For now, enter the app at the dashboard.
export const Route = createFileRoute('/')({
    beforeLoad: () => {
        throw redirect({ to: '/dashboard' });
    },
});
