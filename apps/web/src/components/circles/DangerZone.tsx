import { LogOut, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteCircleDialog } from './DeleteCircleDialog';

interface DangerZoneProps {
    name: string;
    members: number;
    /** Only the creator may delete the circle. */
    isCreator: boolean;
}

/** Circle danger zone — leave (everyone) and delete (creator only). */
export function DangerZone({ name, members, isCreator }: DangerZoneProps) {
    return (
        <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-coral/30 bg-surface p-5 md:p-6">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-coral/80 to-transparent" />
            <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
                    Zone de danger
                </div>
                <p className="mt-1.5 max-w-[52ch] text-[13px] text-ink-3">
                    Quitter libère votre place ; un autre admin garde la main. Supprimer efface le
                    cercle et son classement pour les {members} membres — définitivement.
                </p>
            </div>

            <div className="flex items-center gap-3.5 rounded-[13px] border border-line bg-surface p-3.5">
                <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-line bg-surface-3 text-ink-2">
                    <LogOut size={18} />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">Quitter le cercle</div>
                    <div className="mt-0.5 text-xs text-ink-3">
                        Vous pourrez le rejoindre à nouveau avec le code
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="border border-coral/35 text-coral hover:bg-coral/10 hover:text-coral"
                >
                    Quitter
                </Button>
            </div>

            {isCreator && (
                <div className="flex items-center gap-3.5 rounded-[13px] border border-coral/30 bg-gradient-to-r from-coral/[0.06] to-surface p-3.5">
                    <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-coral/30 bg-coral/12 text-coral">
                        <Skull size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">Supprimer le cercle</div>
                        <div className="mt-0.5 text-xs text-ink-3">
                            Réservé au créateur · action irréversible
                        </div>
                    </div>
                    <DeleteCircleDialog name={name} members={members}>
                        <Button variant="destructive" size="sm">
                            <Skull size={15} strokeWidth={2} /> Supprimer
                        </Button>
                    </DeleteCircleDialog>
                </div>
            )}
        </div>
    );
}
