import { ArrowUp, Crown, MoreVertical, Star, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { CircleMember } from '@/types/circle';
import { RolePill } from './RolePill';

const fmt = (n: number) => n.toLocaleString('fr-FR');

interface MemberRowProps {
    member: CircleMember;
    /** Promote a member to circle admin. */
    onPromote?: () => void;
    /** Demote an admin back to member. */
    onDemote?: () => void;
    /** Remove the member from the circle (confirmed in the dialog). */
    onRemove?: () => void;
    /** Disables the admin actions while a mutation is in flight. */
    pending?: boolean;
}

/** Member roster row — identity, role, score, and admin actions. */
export function MemberRow({ member, onPromote, onDemote, onRemove, pending }: MemberRowProps) {
    const [removeOpen, setRemoveOpen] = useState(false);
    const { isYou } = member;

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-[13px] border border-line bg-surface p-3',
                isYou &&
                    'bg-gradient-to-r from-magenta/[0.06] to-surface outline outline-1 outline-offset-1 outline-magenta/55',
            )}
        >
            <Avatar className={cn('size-[42px] shrink-0', isYou && 'ring-2 ring-magenta/70')}>
                <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-sm font-extrabold text-[#07140b]">
                    {member.initials}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                        {isYou ? 'Vous' : member.name}
                    </span>
                    {member.isCreator && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-3">
                            <Star size={12} strokeWidth={2} /> Créateur
                        </span>
                    )}
                </div>
                <div className="truncate font-mono text-xs text-ink-3">{member.handle}</div>
            </div>

            <RolePill role={member.role} />
            <span className="hidden w-16 text-right font-display text-base font-bold tabular-nums sm:inline">
                {fmt(member.points)}
            </span>

            {/* Admin actions — never on yourself (leave via circle settings). */}
            {!isYou && (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label={`Gérer ${member.name}`}
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink"
                            >
                                <MoreVertical size={18} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Gérer ce membre</DropdownMenuLabel>
                            {member.role === 'admin' ? (
                                <DropdownMenuItem disabled={pending} onSelect={onDemote}>
                                    <ArrowUp size={16} /> Rétrograder en membre
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem disabled={pending} onSelect={onPromote}>
                                    <Crown size={16} /> Promouvoir admin
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setRemoveOpen(true)}
                            >
                                <X size={16} /> Retirer du cercle
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                        <DialogContent
                            showCloseButton={false}
                            className="max-w-[420px] border-coral/30"
                        >
                            <div className="flex items-center gap-3.5">
                                <Avatar className="size-12 shrink-0">
                                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                                        {member.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <DialogTitle className="font-display text-xl font-extrabold leading-tight">
                                        Retirer {member.name} ?
                                    </DialogTitle>
                                    <p className="mt-1 text-[13px] text-ink-3">
                                        Sa sélection et ses {fmt(member.points)} pts quittent le
                                        classement. Il pourra revenir avec le code.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 flex gap-3">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="h-12 flex-1">
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    className="h-12 flex-[1.3]"
                                    disabled={pending}
                                    onClick={() => {
                                        onRemove?.();
                                        setRemoveOpen(false);
                                    }}
                                >
                                    <X size={16} strokeWidth={2.4} /> Retirer
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
