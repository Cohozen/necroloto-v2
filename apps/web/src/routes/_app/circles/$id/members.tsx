import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { CircleAdminHeader } from '@/components/circles/CircleAdminHeader';
import { MemberRow } from '@/components/circles/MemberRow';
import type { CircleMember } from '@/types/circle';

export const Route = createFileRoute('/_app/circles/$id/members')({
    component: CircleMembers,
});

const CIRCLE = { name: 'Les Faucheurs du Dimanche', members: 8 };

// TEMP mock data — replaced by the API (membership roster) in the data step.
const MEMBERS: CircleMember[] = [
    {
        id: 'sasha',
        name: 'Sasha Volkov',
        handle: '@sasha_v',
        initials: 'SV',
        rank: 1,
        points: 615,
        role: 'admin',
    },
    {
        id: 'you',
        name: 'Vous',
        handle: '@croque_mort',
        initials: 'CV',
        rank: 2,
        points: 420,
        role: 'admin',
        isYou: true,
        isCreator: true,
    },
    {
        id: 'priya',
        name: 'Priya Raman',
        handle: '@priya',
        initials: 'PR',
        rank: 3,
        points: 360,
        role: 'member',
    },
    {
        id: 'mort',
        name: 'Mortimer Lake',
        handle: '@mortimer',
        initials: 'MO',
        rank: 4,
        points: 300,
        role: 'member',
    },
    {
        id: 'lea',
        name: 'Léa Khoury',
        handle: '@lea_k',
        initials: 'LK',
        rank: 5,
        points: 280,
        role: 'member',
    },
    {
        id: 'babet',
        name: 'Babette Lenoir',
        handle: '@babette',
        initials: 'BA',
        rank: 6,
        points: 210,
        role: 'member',
    },
    {
        id: 'glen',
        name: 'Glen Hawksworth',
        handle: '@glen',
        initials: 'GL',
        rank: 7,
        points: 180,
        role: 'member',
    },
    {
        id: 'gege',
        name: 'Tonton Gégé',
        handle: '@gege',
        initials: 'GG',
        rank: 8,
        points: 120,
        role: 'member',
    },
];

function CircleMembers() {
    const { id } = Route.useParams();
    const admins = MEMBERS.filter((member) => member.role === 'admin').length;

    return (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-5 p-4 md:p-6">
            <CircleAdminHeader
                id={id}
                name={CIRCLE.name}
                visibility="PRIVATE"
                members={CIRCLE.members}
                active="members"
            />

            <div className="flex items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Membres · {CIRCLE.members}</h2>
                    <p className="mt-0.5 text-xs text-ink-3">
                        {admins} admins · {CIRCLE.members - admins} membres
                    </p>
                </div>
                <button
                    type="button"
                    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-neon/50 bg-neon/[0.08] px-3 text-[13px] font-semibold text-neon"
                >
                    <Plus size={14} strokeWidth={2.2} /> Inviter
                </button>
            </div>

            <div className="flex flex-col gap-2.5">
                {MEMBERS.map((member) => (
                    <MemberRow key={member.id} member={member} />
                ))}
            </div>
        </div>
    );
}
