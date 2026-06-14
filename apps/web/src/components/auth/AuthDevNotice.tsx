import { KeyRound } from 'lucide-react';

interface AuthDevNoticeProps {
    /** Heading for the auth action, e.g. "Connexion" or "Créer un compte". */
    title: string;
}

/**
 * Shown inside the auth card when Clerk has no publishable key (local preview).
 * Keeps the themed shell verifiable without real auth wired up.
 */
export function AuthDevNotice({ title }: AuthDevNoticeProps) {
    return (
        <div className="flex flex-col gap-5 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-[0.01em]">{title}</h1>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-line-2 bg-surface-2 p-5">
                <span className="flex size-11 items-center justify-center rounded-xl border border-neon/30 bg-neon/10 text-neon">
                    <KeyRound size={20} />
                </span>
                <p className="text-sm text-ink-2">
                    Auth non configurée. Définissez{' '}
                    <code className="font-mono text-ink">VITE_CLERK_PUBLISHABLE_KEY</code> pour
                    activer Clerk — le formulaire s'affichera ici, habillé du thème néon.
                </p>
            </div>
        </div>
    );
}
