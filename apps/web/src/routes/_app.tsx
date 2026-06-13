import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/AppShell';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppLayout() {
    // Dev fallback: without Clerk keys, render the shell so the UI is previewable.
    if (!isClerkConfigured) return <AppShell />;

    return (
        <>
            <SignedIn>
                <AppShell />
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
