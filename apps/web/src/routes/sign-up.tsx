import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const Route = createFileRoute('/sign-up')({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <AuthLayout>
            <SignUpForm />
        </AuthLayout>
    );
}
