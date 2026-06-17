import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useUpdateUser } from '@/lib/api/queries';
import type { ApiUser } from '@/lib/api/types';

interface EditProfileDialogProps {
    user: ApiUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const field =
    'flex h-[50px] items-center rounded-xl border border-line-2 bg-surface-2 px-3.5 transition-colors focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30';

/** Edit the player's identity (pseudo / name) via PATCH /users/:id. Controlled. */
export function EditProfileDialog({ user, open, onOpenChange }: EditProfileDialogProps) {
    const updateUser = useUpdateUser();

    const [username, setUsername] = useState(user.username ?? '');
    const [firstname, setFirstname] = useState(user.firstname ?? '');
    const [lastname, setLastname] = useState(user.lastname ?? '');

    // Re-seed from the latest user each time the dialog opens.
    useEffect(() => {
        if (open) {
            setUsername(user.username ?? '');
            setFirstname(user.firstname ?? '');
            setLastname(user.lastname ?? '');
        }
    }, [open, user.username, user.firstname, user.lastname]);

    const handleSave = () => {
        updateUser.mutate(
            {
                id: user.id,
                clerkId: user.clerkId,
                username: username.trim() || undefined,
                firstname: firstname.trim() || undefined,
                lastname: lastname.trim() || undefined,
            },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-[440px]">
                <DialogTitle className="font-display text-xl font-extrabold leading-tight">
                    Pseudo & identité
                </DialogTitle>

                <div className="mt-2 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-semibold text-ink-2">Pseudo</span>
                        <div className={field}>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="croque_mort"
                                className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                            />
                        </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-semibold text-ink-2">Prénom</span>
                            <div className={field}>
                                <input
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
                                />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-semibold text-ink-2">Nom</span>
                            <div className={field}>
                                <input
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
                                />
                            </div>
                        </label>
                    </div>
                </div>

                {updateUser.isError && (
                    <p className="mt-2 text-[13px] text-coral">
                        La mise à jour a échoué. Réessayez.
                    </p>
                )}

                <div className="mt-4 flex gap-3">
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-12 flex-1">
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        className="h-12 flex-[1.3]"
                        disabled={updateUser.isPending}
                        onClick={handleSave}
                    >
                        <Check size={16} strokeWidth={2.4} />{' '}
                        {updateUser.isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
