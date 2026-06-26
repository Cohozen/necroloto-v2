import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toAdminCelebrity } from '@/lib/api/adapters';
import { useAdminCelebrities, useMergeCelebrities } from '@/lib/api/queries';
import type { AdminCelebrity } from '@/types/admin';

interface MergeCelebrityDialogProps {
    /** The duplicate to fold into a target (null closes the dialog). */
    source: AdminCelebrity | null;
    onClose: () => void;
}

/**
 * Admin merge: pick the target celebrity the `source` duplicate folds into.
 * Bets on the source are redirected to the target and the source is deleted.
 */
export function MergeCelebrityDialog({ source, onClose }: MergeCelebrityDialogProps) {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const merge = useMergeCelebrities();

    useEffect(() => {
        const id = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    // Reset the search when a new source is opened.
    useEffect(() => {
        if (source) setSearch('');
    }, [source]);

    const { data } = useAdminCelebrities({ search: debounced, status: 'all' });
    const candidates = (data?.pages ?? [])
        .flatMap((page) => page.items)
        .map(toAdminCelebrity)
        .filter((c) => c.id !== source?.id && c.proposalStatus !== 'pending')
        .slice(0, 20);

    const handlePick = (target: AdminCelebrity) => {
        if (!source) return;
        merge.mutate(
            { sourceId: source.id, targetId: target.id },
            {
                onSuccess: () => {
                    toast.success(`« ${source.name} » fusionnée dans « ${target.name} ».`);
                    onClose();
                },
                onError: () => toast.error('La fusion a échoué.'),
            },
        );
    };

    return (
        <Dialog open={!!source} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[520px] gap-0 border-line bg-gradient-to-b from-surface-2 to-surface">
                <DialogTitle className="font-display text-[22px] font-extrabold">
                    Fusionner une célébrité
                </DialogTitle>
                <DialogDescription className="text-[13px] text-ink-3">
                    {source ? (
                        <>
                            Choisissez la fiche dans laquelle fondre{' '}
                            <span className="font-semibold text-ink-2">{source.name}</span>. Ses
                            paris seront redirigés, puis la fiche en double supprimée.
                        </>
                    ) : null}
                </DialogDescription>

                <div className="mt-4 flex h-[46px] items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 px-3.5 focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30">
                    <Search size={17} className="shrink-0 text-ink-3" />
                    <input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher la fiche cible"
                        className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                    />
                </div>

                <div className="mt-4 flex max-h-[340px] flex-col gap-2 overflow-y-auto">
                    {candidates.length === 0 && (
                        <p className="py-6 text-center text-sm text-ink-3">Aucune fiche cible.</p>
                    )}
                    {candidates.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            disabled={merge.isPending}
                            onClick={() => handlePick(c)}
                            className="flex items-center justify-between gap-3 rounded-xl border border-line-2 bg-surface px-3.5 py-3 text-left transition-colors hover:border-neon/40 hover:bg-surface-2 disabled:opacity-60"
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-[14.5px] font-semibold">
                                    {c.name}
                                </span>
                                {c.role && (
                                    <span className="block truncate text-xs text-ink-3">
                                        {c.role}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 font-mono text-[12px] text-ink-3">
                                {c.born || '?'}
                            </span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
