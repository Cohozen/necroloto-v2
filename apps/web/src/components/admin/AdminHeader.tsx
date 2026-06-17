import { useRouter } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminBadge } from './AdminBadge';

interface AdminHeaderProps {
    /** Current page label, shown after the "Catalogue / Admin" crumb. */
    crumb: string;
    /** Optional trailing actions (e.g. "Nouvelle célébrité"). */
    actions?: ReactNode;
}

/** In-page admin header — breadcrumb + global-admin role badge. */
export function AdminHeader({ crumb, actions }: AdminHeaderProps) {
    const router = useRouter();

    // Real "back": previous history entry (catalogue from a fiche, profile from
    // the catalogue). Falls back to /profile on a cold load with no history.
    const goBack = () => {
        if (router.history.length > 1) {
            router.history.back();
        } else {
            router.navigate({ to: '/profile' });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={goBack}
                className="inline-flex size-9 items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2"
                aria-label="Retour"
            >
                <ChevronRight size={18} className="rotate-180" />
            </button>
            <span className="text-[13px] text-ink-3">
                Catalogue <span className="opacity-50">/</span>{' '}
                <span className="text-ink">{crumb}</span>
            </span>
            <AdminBadge className="ml-1" />
            <div className="ml-auto flex items-center gap-2.5">{actions}</div>
        </div>
    );
}
