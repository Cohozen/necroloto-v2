import { useSignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, Lock, Mail, Zap } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthErrorBanner, AuthFormLoader, getClerkErrorMessage } from './AuthFeedback';
import { AuthField } from './AuthField';
import { GoogleButton } from './GoogleButton';
import { startGoogleOAuth } from './sso';

/** Custom email/password + Google sign-in form (headless Clerk, no widget). */
export function SignInForm() {
    const signInState = useSignIn();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!signInState.isLoaded) return <AuthFormLoader />;
    const { signIn, setActive } = signInState;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            const result = await signIn.create({ identifier: email, password });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                navigate({ to: '/dashboard' });
                return;
            }
            setError('Connexion incomplète — réessayez.');
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleGoogle() {
        startGoogleOAuth(signIn).catch((err) => toast.error(getClerkErrorMessage(err)));
    }

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-3xl font-extrabold tracking-[0.01em]">
                    Connexion
                </h1>
                <p className="text-ink-2">Reprenez là où le destin vous attend.</p>
            </header>

            <GoogleButton onClick={handleGoogle} disabled={submitting} />

            <div className="flex items-center gap-3.5">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">
                    ou
                </span>
                <span className="h-px flex-1 bg-line" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <AuthField
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                />
                <div className="flex flex-col gap-2">
                    <AuthField
                        label="Mot de passe"
                        icon={Lock}
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                    <Link
                        to="/forgot-password"
                        className="self-end text-[13px] font-semibold text-neon hover:brightness-110"
                    >
                        Mot de passe oublié ?
                    </Link>
                </div>

                {error && <AuthErrorBanner message={error} />}

                <Button type="submit" size="lg" className="mt-0.5 w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" /> : <Zap size={17} />}
                    {submitting ? 'Connexion en cours…' : 'Continuer'}
                </Button>
            </form>

            <p className="text-center text-[14px] text-ink-3">
                Pas encore de compte ?{' '}
                <Link to="/sign-up" className="font-bold text-neon hover:brightness-110">
                    S'inscrire
                </Link>
            </p>
        </div>
    );
}
