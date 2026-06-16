import { Skull, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DeleteCircleDialogProps {
    name: string;
    members: number;
    children: ReactNode;
    /** Confirmed deletion handler — called once the confirm word is typed. */
    onConfirm?: () => void;
    /** Disables the confirm button while the deletion is in flight. */
    pending?: boolean;
}

const CONFIRM = 'SUPPRIMER';

/** Delete a circle — irreversible, gated behind typing the confirm word. */
export function DeleteCircleDialog({
    name,
    members,
    children,
    onConfirm,
    pending,
}: DeleteCircleDialogProps) {
    const [value, setValue] = useState('');
    const confirmed = value === CONFIRM;

    return (
        <Dialog onOpenChange={() => setValue('')}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                showCloseButton={false}
                className="max-w-[480px] gap-0 border-coral/30 bg-gradient-to-b from-surface-2 to-surface text-center shadow-glow-coral"
            >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-coral/80 to-transparent" />
                <div className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full border border-coral/40 bg-coral/12 text-coral">
                    <Skull size={36} strokeWidth={1.8} />
                </div>
                <DialogTitle className="font-display text-[26px] font-extrabold leading-tight">
                    Supprimer ce cercle ?
                </DialogTitle>
                <p className="mx-auto mt-2 max-w-[36ch] text-sm text-ink-2">
                    « <b className="text-ink">{name}</b> » et tout son classement 2026 seront
                    effacés. Action <b className="text-coral">irréversible</b>.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-coral/30 bg-surface px-3.5 py-3 text-left">
                    <Zap size={18} strokeWidth={2} className="shrink-0 text-coral" />
                    <span className="text-[13px] font-semibold">
                        {members} membres perdront leur sélection et leurs points
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-left">
                    <label htmlFor="confirm-delete" className="text-[12.5px] text-ink-2">
                        Tapez <b className="font-mono text-coral">{CONFIRM}</b> pour confirmer
                    </label>
                    <input
                        id="confirm-delete"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={CONFIRM}
                        className={cn(
                            'h-[50px] rounded-xl border bg-surface-2 px-3.5 font-mono text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3',
                            confirmed
                                ? 'border-neon/50 focus:ring-2 focus:ring-neon/30'
                                : 'border-coral/40 focus:ring-2 focus:ring-coral/30',
                        )}
                    />
                </div>
                <div className="mt-5 flex gap-3">
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-12 flex-1">
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={!confirmed || pending}
                        onClick={onConfirm}
                        className="h-12 flex-[1.4]"
                    >
                        <Skull size={16} strokeWidth={2} />{' '}
                        {pending ? 'Suppression…' : 'Supprimer définitivement'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
