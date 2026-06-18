import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';

export const Route = createFileRoute('/sign-in')({
    component: SignInPage,
});

function SignInPage() {
    return (
        <AuthLayout>
            <SignInForm />
        </AuthLayout>
    );
}
