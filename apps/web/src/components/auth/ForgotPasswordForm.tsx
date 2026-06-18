import { useSignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Lock, Mail, Zap } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { AuthErrorBanner, AuthFormLoader, getClerkErrorMessage } from './AuthFeedback';
import { AuthField } from './AuthField';

const slotClass =
    'h-14 w-12 rounded-xl border border-line-2 bg-surface-2 font-display text-2xl text-ink data-[active=true]:border-neon data-[active=true]:ring-2 data-[active=true]:ring-neon/30';

/**
 * Two-phase password reset via Clerk's reset_password_email_code strategy:
 * (1) request a code by e-mail, (2) enter the code + a new password.
 */
export function ForgotPasswordForm() {
    const signInState = useSignIn();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!signInState.isLoaded) return <AuthFormLoader />;
    const { signIn, setActive } = signInState;

    async function requestCode(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
            setPhase('code');
            toast.success('Code envoyé — vérifiez votre boîte mail.');
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    async function resetPassword(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                navigate({ to: '/dashboard' });
                return;
            }
            setError('Réinitialisation incomplète — réessayez.');
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-3xl font-extrabold tracking-[0.01em]">
                    Mot de passe oublié
                </h1>
                <p className="text-ink-2">
                    {phase === 'email'
                        ? 'On vous envoie un code pour repartir de zéro.'
                        : `Code envoyé à ${email}. Choisissez un nouveau mot de passe.`}
                </p>
            </header>

            {phase === 'email' ? (
                <form className="flex flex-col gap-4" onSubmit={requestCode}>
                    <AuthField
                        label="Adresse e-mail"
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                    />
                    {error && <AuthErrorBanner message={error} />}
                    <Button type="submit" size="lg" className="mt-0.5 w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" /> : <Zap size={17} />}
                        {submitting ? 'Envoi en cours…' : 'Envoyer le code'}
                    </Button>
                </form>
            ) : (
                <form className="flex flex-col gap-4" onSubmit={resetPassword}>
                    <div className="flex flex-col gap-2">
                        <span className="text-[13px] font-semibold text-ink-2">
                            Code de vérification
                        </span>
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={setCode}
                            containerClassName="gap-2"
                        >
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={0} className={slotClass} />
                                <InputOTPSlot index={1} className={slotClass} />
                                <InputOTPSlot index={2} className={slotClass} />
                            </InputOTPGroup>
                            <InputOTPSeparator className="text-ink-3" />
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={3} className={slotClass} />
                                <InputOTPSlot index={4} className={slotClass} />
                                <InputOTPSlot index={5} className={slotClass} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <AuthField
                        label="Nouveau mot de passe"
                        icon={Lock}
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="8 caractères minimum"
                        autoComplete="new-password"
                    />
                    {error && <AuthErrorBanner message={error} />}
                    <Button type="submit" size="lg" className="mt-0.5 w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" /> : <Zap size={17} />}
                        {submitting ? 'Validation en cours…' : 'Réinitialiser'}
                    </Button>
                </form>
            )}

            <Link
                to="/sign-in"
                className="inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold text-ink-3 hover:text-ink-2"
            >
                <ArrowLeft size={15} /> Retour à la connexion
            </Link>
        </div>
    );
}
