import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, Lock, Mail, Zap } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthErrorBanner, AuthFormLoader, getClerkErrorMessage } from './AuthFeedback';
import { AuthField } from './AuthField';
import { GoogleButton } from './GoogleButton';
import { startGoogleOAuth } from './sso';

/** Custom email/password + Google sign-up form (headless Clerk, no email OTP step). */
export function SignUpForm() {
    const signUpState = useSignUp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!signUpState.isLoaded) return <AuthFormLoader />;
    const { signUp, setActive } = signUpState;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            const result = await signUp.create({ emailAddress: email, password });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                navigate({ to: '/dashboard' });
                return;
            }
            // No OTP step is wired: a non-complete status means the Clerk instance
            // still requires email verification — surface it instead of hanging.
            setError(
                "Vérification e-mail requise par la configuration Clerk. Désactivez-la ou contactez l'administrateur.",
            );
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleGoogle() {
        startGoogleOAuth(signUp).catch((err) => toast.error(getClerkErrorMessage(err)));
    }

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-3xl font-extrabold tracking-[0.01em]">
                    Créer un compte
                </h1>
                <p className="text-ink-2">Choisissez votre arène, et que le meilleur gagne.</p>
            </header>

            <GoogleButton
                onClick={handleGoogle}
                disabled={submitting}
                label="S'inscrire avec Google"
            />

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
                <AuthField
                    label="Mot de passe"
                    icon={Lock}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="8 caractères minimum"
                    autoComplete="new-password"
                />

                {error && <AuthErrorBanner message={error} />}

                {/* Clerk Smart CAPTCHA renders here when bot-protection is enabled. */}
                <div id="clerk-captcha" />

                <Button type="submit" size="lg" className="mt-0.5 w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" /> : <Zap size={17} />}
                    {submitting ? 'Création en cours…' : 'Créer mon compte'}
                </Button>

                <p className="text-center text-xs leading-relaxed text-ink-3">
                    En continuant, vous acceptez les <span className="underline">CGU</span> et la{' '}
                    <span className="underline">Politique de confidentialité</span>.
                </p>
            </form>

            <p className="text-center text-[14px] text-ink-3">
                Déjà un compte ?{' '}
                <Link to="/sign-in" className="font-bold text-neon hover:brightness-110">
                    Se connecter
                </Link>
            </p>
        </div>
    );
}
