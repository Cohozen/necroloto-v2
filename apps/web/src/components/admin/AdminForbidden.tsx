import { Link } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';
import { NeonSurface } from '@/components/layout/NeonSurface';
import { Button } from '@/components/ui/button';

/** Shown when a signed-in non-admin reaches an /admin route. */
export function AdminForbidden() {
    return (
        <NeonSurface className="flex min-h-[70dvh] items-center justify-center p-6">
            <div className="relative z-[1] flex w-full max-w-[360px] flex-col items-center gap-6 text-center">
                <span className="flex size-[88px] items-center justify-center rounded-full border border-coral/40 bg-coral/12 text-coral">
                    <ShieldAlert size={40} strokeWidth={1.8} />
                </span>
                <div>
                    <h1 className="font-display text-[30px] font-extrabold leading-tight">
                        Accès réservé
                    </h1>
                    <p className="mx-auto mt-2 max-w-[40ch] text-sm text-ink-2">
                        L'administration du catalogue est réservée aux administrateurs. Votre compte
                        n'a pas ce rôle.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/dashboard">Retour à l'accueil</Link>
                </Button>
            </div>
        </NeonSurface>
    );
}
