import { Skull, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteCelebrityDialogProps {
    name: string;
    /** Points the affected lists would lose. */
    points: number;
    bettors: number;
    onConfirm: () => void;
    isPending?: boolean;
    children: ReactNode;
}

/** Irreversible delete confirmation for a catalogue entry. */
export function DeleteCelebrityDialog({
    name,
    points,
    bettors,
    onConfirm,
    isPending,
    children,
}: DeleteCelebrityDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                showCloseButton={false}
                className="max-w-[460px] gap-0 border-coral/30 bg-gradient-to-b from-surface-2 to-surface text-center shadow-glow-coral"
            >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-coral/80 to-transparent" />
                <div className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full border border-coral/40 bg-coral/12 text-coral">
                    <Skull size={36} strokeWidth={1.8} />
                </div>
                <DialogTitle className="font-display text-[26px] font-extrabold leading-tight">
                    Supprimer cette fiche ?
                </DialogTitle>
                <p className="mx-auto mt-2 max-w-[34ch] text-sm text-ink-2">
                    « <b className="text-ink">{name}</b> » sera retirée du catalogue. Action{' '}
                    <b className="text-coral">irréversible</b>.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-coral/30 bg-surface px-3.5 py-3 text-left">
                    <Zap size={18} strokeWidth={2} className="shrink-0 text-coral" />
                    <span className="text-[13px] font-semibold">
                        {bettors} listes perdront <span className="text-coral">{points} pts</span>
                    </span>
                </div>
                <div className="mt-5 flex gap-3">
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-12 flex-1">
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="h-12 flex-[1.4]"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        <Skull size={16} strokeWidth={2} />
                        {isPending ? 'Suppression…' : 'Supprimer définitivement'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
