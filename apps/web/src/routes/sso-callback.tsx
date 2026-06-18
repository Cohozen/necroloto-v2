import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { AppLoadingGate } from '@/components/auth/AppLoadingGate';

export const Route = createFileRoute('/sso-callback')({
    component: SsoCallbackPage,
});

/** OAuth return target: Clerk finishes the handshake, then redirects to /dashboard. */
function SsoCallbackPage() {
    return (
        <>
            <AppLoadingGate />
            <AuthenticateWithRedirectCallback
                signInForceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
            />
        </>
    );
}
