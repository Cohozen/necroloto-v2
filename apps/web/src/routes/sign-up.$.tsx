import { SignUp } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { AuthDevNotice } from '@/components/auth/AuthDevNotice';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { isClerkConfigured } from '@/lib/auth/clerk';
import { clerkAppearance } from '@/lib/auth/clerk-appearance';

export const Route = createFileRoute('/sign-up/$')({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <AuthLayout>
            {isClerkConfigured ? (
                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    appearance={clerkAppearance}
                />
            ) : (
                <AuthDevNotice title="Créer un compte" />
            )}
        </AuthLayout>
    );
}
