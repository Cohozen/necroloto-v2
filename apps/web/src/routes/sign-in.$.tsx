import { SignIn } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { AuthDevNotice } from '@/components/auth/AuthDevNotice';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { isClerkConfigured } from '@/lib/auth/clerk';
import { clerkAppearance } from '@/lib/auth/clerk-appearance';

export const Route = createFileRoute('/sign-in/$')({
    component: SignInPage,
});

function SignInPage() {
    return (
        <AuthLayout>
            {isClerkConfigured ? (
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    appearance={clerkAppearance}
                />
            ) : (
                <AuthDevNotice title="Connexion" />
            )}
        </AuthLayout>
    );
}
