import {
    ClerkLoaded,
    ClerkLoading,
    RedirectToSignIn,
    SignedIn,
    SignedOut,
} from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { AppLoadingGate } from '@/components/auth/AppLoadingGate';
import { CurrentUserProvider } from '@/components/auth/CurrentUserProvider';
import { AppShell } from '@/components/layout/AppShell';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppLayout() {
    // Dev fallback: without Clerk keys, render the shell so the UI is previewable.
    if (!isClerkConfigured)
        return (
            <CurrentUserProvider>
                <AppShell />
            </CurrentUserProvider>
        );

    return (
        <>
            <ClerkLoading>
                <AppLoadingGate />
            </ClerkLoading>
            <ClerkLoaded>
                <SignedIn>
                    <CurrentUserProvider>
                        <AppShell />
                    </CurrentUserProvider>
                </SignedIn>
                <SignedOut>
                    <RedirectToSignIn />
                </SignedOut>
            </ClerkLoaded>
        </>
    );
}
