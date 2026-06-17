import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { InviteCodeBox } from './InviteCodeBox';

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Circle invite code, or null when none is set yet. */
    code: string | null;
}

/** Popup sharing the circle's invite code (instead of routing to settings). */
export function InviteDialog({ open, onOpenChange, code }: InviteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[440px]">
                <DialogTitle className="font-display text-xl font-extrabold leading-tight">
                    Inviter dans le cercle
                </DialogTitle>
                <DialogDescription className="text-[13px] text-ink-3">
                    Partagez ce code : vos amis le saisissent pour rejoindre le cercle.
                </DialogDescription>
                <div className="mt-2">
                    {code ? (
                        <InviteCodeBox code={code} />
                    ) : (
                        <p className="text-[13px] text-ink-3">
                            Aucun code d'invitation n'est défini pour ce cercle.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
