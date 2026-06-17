import type { CircleVisibility } from '@/types/circle';
import { CircleBackLink } from './CircleBackLink';
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
            <CircleBackLink />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <CircleHeader name={name} visibility={visibility} members={members} />
                <CircleRoleBadge />
            </div>
            <CircleTabs id={id} active={active} />
        </div>
    );
}
