import { SignUp } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/sign-up/$')({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center p-6">
            {isClerkConfigured ? (
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            ) : (
                <p className="text-ink-2">
                    Auth non configurée — définissez{' '}
                    <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code>.
                </p>
            )}
        </div>
    );
}
