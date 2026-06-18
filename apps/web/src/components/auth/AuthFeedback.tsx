import { Loader2, Skull } from 'lucide-react';

/** Extract a human-readable message from a Clerk API error (or any thrown value). */
export function getClerkErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'errors' in err) {
        const first = (err as { errors?: Array<{ longMessage?: string; message?: string }> })
            .errors?.[0];
        if (first) return first.longMessage ?? first.message ?? 'Une erreur est survenue.';
    }
    if (err instanceof Error) return err.message;
    return 'Une erreur est survenue.';
}

/** Coral error banner — mirrors the .nl-msg--error block in the mockups. */
export function AuthErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-[13px] font-medium text-coral">
            <Skull size={16} className="shrink-0" />
            <span>{message}</span>
        </div>
    );
}

/** Centered spinner shown while Clerk resolves (`isLoaded === false`). */
export function AuthFormLoader() {
    return (
        <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 size={28} className="animate-spin text-neon" />
        </div>
    );
}
