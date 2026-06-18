import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const Route = createFileRoute('/forgot-password')({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
