import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import type { CircleVisibility } from '@/types/circle';
import { CircleHeader } from './CircleHeader';
import { CircleRoleBadge } from './CircleRoleBadge';
import { CircleTabs } from './CircleTabs';

interface CircleAdminHeaderProps {
    id: string;
    name: string;
    visibility: CircleVisibility;
    members: number;
    active: 'members' | 'settings';
}

/** Shared chrome for circle-admin tabs — breadcrumb, identity, role badge, tabs. */
export function CircleAdminHeader({
    id,
    name,
    visibility,
    members,
    active,
}: CircleAdminHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <Link
                to="/circles"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
            >
                <ChevronLeft size={16} /> Mes cercles
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <CircleHeader name={name} visibility={visibility} members={members} />
                <CircleRoleBadge />
            </div>
            <CircleTabs id={id} active={active} />
        </div>
    );
}
