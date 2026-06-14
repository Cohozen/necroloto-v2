import { Link } from '@tanstack/react-router';
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
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Link
                to="/admin/celebrities"
                className="inline-flex size-9 items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2"
                aria-label="Catalogue admin"
            >
                <ChevronRight size={18} className="rotate-180" />
            </Link>
            <span className="text-[13px] text-ink-3">
                Catalogue <span className="opacity-50">/</span>{' '}
                <span className="text-ink">{crumb}</span>
            </span>
            <AdminBadge className="ml-1" />
            <div className="ml-auto flex items-center gap-2.5">{actions}</div>
        </div>
    );
}
