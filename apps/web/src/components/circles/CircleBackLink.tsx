import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

/** Breadcrumb back-link to the circles hub, shared by the circle pages. */
export function CircleBackLink() {
    return (
        <Link
            to="/circles"
            className="inline-flex w-fit items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
            <ChevronLeft size={16} /> Mes cercles
        </Link>
    );
}
