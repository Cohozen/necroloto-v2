import { SignIn } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/sign-in/$')({
    component: SignInPage,
});

function SignInPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center p-6">
            {isClerkConfigured ? (
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            ) : (
                <p className="text-ink-2">
                    Auth non configurée — définissez{' '}
                    <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code>.
                </p>
            )}
        </div>
    );
}
