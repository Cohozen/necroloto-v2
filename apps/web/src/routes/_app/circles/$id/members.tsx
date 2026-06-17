import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CircleAdminHeader } from '@/components/circles/CircleAdminHeader';
import { InviteDialog } from '@/components/circles/InviteDialog';
import { MemberRow } from '@/components/circles/MemberRow';
import { toCircleMember } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import {
    useCircleDetail,
    useCircleRank,
    useRemoveMember,
    useUpdateMemberRole,
} from '@/lib/api/queries';
import type { ApiCircle } from '@/lib/api/types';
import type { CircleMember } from '@/types/circle';

export const Route = createFileRoute('/_app/circles/$id/members')({
    component: CircleMembers,
});

/** Earliest-joined ADMIN, used as the circle creator (no creator field in DB). */
function creatorUserId(circle: ApiCircle): string | undefined {
    const admins = (circle.memberships ?? [])
        .filter((m) => m.role === 'ADMIN')
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    return admins[0]?.userId;
}

/** Rank ascending; members without a bet this year (rank 0) sink to the bottom. */
function byRank(a: CircleMember, b: CircleMember): number {
    if (a.rank === 0 && b.rank === 0) return 0;
    if (a.rank === 0) return 1;
    if (b.rank === 0) return -1;
    return a.rank - b.rank;
}

function CircleMembers() {
    const { id } = Route.useParams();
    const { user } = useCurrentUser();
    const [inviteOpen, setInviteOpen] = useState(false);
    const circleQuery = useCircleDetail(id);
    const rankQuery = useCircleRank(id);
    const removeMember = useRemoveMember(id);
    const updateRole = useUpdateMemberRole(id);

    const circle = circleQuery.data;

    const members = useMemo<CircleMember[]>(() => {
        if (!circle) return [];
        const rankByUser = new Map((rankQuery.data ?? []).map((bet) => [bet.userId, bet]));
        const creatorId = creatorUserId(circle);
        return (circle.memberships ?? [])
            .map((m) => toCircleMember(m, rankByUser.get(m.userId), user?.id, creatorId))
            .sort(byRank);
    }, [circle, rankQuery.data, user?.id]);

    if (circleQuery.isLoading) {
        return <p className="p-6 text-sm text-ink-3">Chargement…</p>;
    }
    if (!circle) {
        return <p className="p-6 text-sm text-coral">Cercle introuvable.</p>;
    }

    const total = members.length;
    const admins = members.filter((member) => member.role === 'admin').length;
    const pending = removeMember.isPending || updateRole.isPending;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
            <CircleAdminHeader
                id={id}
                name={circle.name}
                visibility={circle.visibility}
                members={total}
                active="members"
            />

            <div className="flex items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Membres · {total}</h2>
                    <p className="mt-0.5 text-xs text-ink-3">
                        {admins} admins · {total - admins} membres
                    </p>
                </div>
                {/* Invitations are sharing the circle code — no add-by-search endpoint. */}
                <button
                    type="button"
                    onClick={() => setInviteOpen(true)}
                    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-neon/50 bg-neon/[0.08] px-3 text-[13px] font-semibold text-neon"
                >
                    <Plus size={14} strokeWidth={2.2} /> Inviter
                </button>
            </div>

            <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} code={circle.code} />

            <div className="flex flex-col gap-2.5">
                {members.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        pending={pending}
                        onPromote={() => updateRole.mutate({ userId: member.id, role: 'ADMIN' })}
                        onDemote={() => updateRole.mutate({ userId: member.id, role: 'MEMBER' })}
                        onRemove={() => removeMember.mutate(member.id)}
                    />
                ))}
            </div>
        </div>
    );
}
