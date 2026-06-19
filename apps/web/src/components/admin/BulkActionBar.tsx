import { Skull, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface BulkActionBarProps {
    count: number;
    onClear: () => void;
    onDelete: () => void;
    onSync: () => void;
    isDeleting?: boolean;
    isSyncing?: boolean;
    /** Live progress of the running enrich job, if any. */
    syncProgress?: { processed: number; total: number };
}

/** Floating bar of bulk actions for the selected catalogue rows. */
export function BulkActionBar({
    count,
    onClear,
    onDelete,
    onSync,
    isDeleting,
    isSyncing,
    syncProgress,
}: BulkActionBarProps) {
    const busy = isDeleting || isSyncing;
    const syncLabel = isSyncing
        ? syncProgress
            ? `Synchronisation… ${syncProgress.processed}/${syncProgress.total}`
            : 'Synchronisation…'
        : 'Synchroniser Wikidata';
    return (
        <div className="sticky bottom-4 z-20 mx-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-line-2 bg-surface-2/95 px-4 py-3 shadow-glow-soft backdrop-blur-md">
            <button
                type="button"
                onClick={onClear}
                aria-label="Désélectionner"
                className="inline-flex size-8 items-center justify-center rounded-[10px] border border-line-2 bg-surface text-ink-2"
            >
                <X size={16} />
            </button>
            <span className="text-[14px] font-semibold">
                {count} sélectionnée{count > 1 ? 's' : ''}
            </span>

            <div className="ml-auto flex items-center gap-2.5">
                <Button variant="secondary" size="sm" onClick={onSync} disabled={busy}>
                    <Sparkles size={15} strokeWidth={2} />
                    {syncLabel}
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            className="border border-coral/35 text-coral hover:bg-coral/10 hover:text-coral"
                        >
                            <Skull size={15} strokeWidth={2} /> Supprimer
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        showCloseButton={false}
                        className="max-w-[440px] gap-0 border-coral/30 bg-gradient-to-b from-surface-2 to-surface text-center shadow-glow-coral"
                    >
                        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-coral/80 to-transparent" />
                        <div className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full border border-coral/40 bg-coral/12 text-coral">
                            <Skull size={36} strokeWidth={1.8} />
                        </div>
                        <DialogTitle className="font-display text-[26px] font-extrabold leading-tight">
                            Supprimer {count} fiche{count > 1 ? 's' : ''} ?
                        </DialogTitle>
                        <p className="mx-auto mt-2 max-w-[34ch] text-sm text-ink-2">
                            Ces célébrités seront retirées du catalogue. Action{' '}
                            <b className="text-coral">irréversible</b>.
                        </p>
                        <div className="mt-5 flex gap-3">
                            <DialogClose asChild>
                                <Button variant="ghost" className="h-12 flex-1">
                                    Annuler
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button
                                    variant="destructive"
                                    className="h-12 flex-[1.4]"
                                    onClick={onDelete}
                                    disabled={isDeleting}
                                >
                                    <Skull size={16} strokeWidth={2} />
                                    {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
