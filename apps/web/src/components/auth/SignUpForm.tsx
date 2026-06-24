import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, Lock, Mail, Zap } from 'lucide-react';
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
import { GoogleButton } from './GoogleButton';
import { startGoogleOAuth } from './sso';

const slotClass =
    'h-14 w-12 rounded-xl border border-line-2 bg-surface-2 font-display text-2xl text-ink data-[active=true]:border-neon data-[active=true]:ring-2 data-[active=true]:ring-neon/30';

/**
 * Custom email/password + Google sign-up form (headless Clerk). Two-phase when the Clerk
 * instance requires email verification: (1) create the account, (2) confirm the e-mail code
 * (email_code), same OTP pattern as ForgotPasswordForm.
 */
export function SignUpForm() {
    const signUpState = useSignUp();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'signup' | 'verify'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!signUpState.isLoaded) return <AuthFormLoader />;
    const { signUp, setActive } = signUpState;

    async function completeSession(createdSessionId: string | null) {
        await setActive({ session: createdSessionId });
        navigate({ to: '/dashboard' });
    }

    async function submitSignup(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        if (password !== confirmPassword) {
            const message = 'Les deux mots de passe ne correspondent pas.';
            setError(message);
            toast.error(message);
            return;
        }
        setSubmitting(true);
        try {
            const result = await signUp.create({ emailAddress: email, password });
            if (result.status === 'complete') {
                await completeSession(result.createdSessionId);
                return;
            }
            // Email verification required by the Clerk instance: send a code and move to phase 2.
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPhase('verify');
            toast.success('Code envoyé — vérifiez votre boîte mail.');
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    async function submitVerify(e: FormEvent) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code });
            if (result.status === 'complete') {
                await completeSession(result.createdSessionId);
                return;
            }
            setError('Vérification incomplète — réessayez.');
        } catch (err) {
            const message = getClerkErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    async function resendCode() {
        if (submitting) return;
        setError(null);
        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            toast.success('Nouveau code envoyé.');
        } catch (err) {
            toast.error(getClerkErrorMessage(err));
        }
    }

    function handleGoogle() {
        startGoogleOAuth(signUp).catch((err) => toast.error(getClerkErrorMessage(err)));
    }

    if (phase === 'verify') {
        return (
            <div className="flex flex-col gap-5">
                <header className="flex flex-col gap-1">
                    <h1 className="font-display text-3xl font-extrabold tracking-[0.01em]">
                        Vérifiez votre e-mail
                    </h1>
                    <p className="text-ink-2">
                        Code envoyé à {email}. Saisissez-le pour activer votre compte.
                    </p>
                </header>

                <form className="flex flex-col gap-4" onSubmit={submitVerify}>
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

                    {error && <AuthErrorBanner message={error} />}

                    <Button type="submit" size="lg" className="mt-0.5 w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" /> : <Zap size={17} />}
                        {submitting ? 'Vérification en cours…' : 'Activer mon compte'}
                    </Button>
                </form>

                <p className="text-center text-[14px] text-ink-3">
                    Pas reçu de code ?{' '}
                    <button
                        type="button"
                        onClick={resendCode}
                        className="font-bold text-neon hover:brightness-110"
                    >
                        Renvoyer
                    </button>
                </p>
            </div>
        );
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

            <form className="flex flex-col gap-4" onSubmit={submitSignup}>
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
                <AuthField
                    label="Confirmer le mot de passe"
                    icon={Lock}
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Ressaisissez le mot de passe"
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
