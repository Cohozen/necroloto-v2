import { ArrowLeft, Globe, Search, User } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useProposeCelebrity, useWikidataSearch } from '@/lib/api/queries';
import type { ProposeCelebrityPayload, WikidataSummaryDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProposeCelebrityDialogProps {
    /** Called with the (created or deduped) celebrity id to add to the draft. */
    onProposed: (celebrityId: string) => void;
    children: ReactNode;
}

/** French year from an ISO date (or "?"). */
function yearOf(iso?: string): string {
    return iso ? String(new Date(iso).getUTCFullYear()) : '?';
}

/**
 * Lets a player add a missing celebrity from the bet draft: Wikidata search
 * first (clean data + dedup on the entity), with a manual fallback. The entry
 * is created PENDING and must be validated by an admin.
 */
export function ProposeCelebrityDialog({ onProposed, children }: ProposeCelebrityDialogProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'search' | 'manual'>('search');
    const propose = useProposeCelebrity();

    // Reset to the search step each time the dialog opens.
    useEffect(() => {
        if (open) setMode('search');
    }, [open]);

    const submit = (payload: ProposeCelebrityPayload) => {
        propose.mutate(payload, {
            onSuccess: (celebrity) => {
                onProposed(celebrity.id);
                setOpen(false);
                toast.success(
                    celebrity.status === 'PENDING'
                        ? `${celebrity.name} ajoutée — en attente de validation.`
                        : `${celebrity.name} ajoutée à votre liste.`,
                );
            },
            onError: (err) =>
                toast.error(
                    err instanceof Error && err.message
                        ? err.message
                        : "L'ajout de la célébrité a échoué.",
                ),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[520px] gap-0 border-line bg-gradient-to-b from-surface-2 to-surface">
                <DialogTitle className="font-display text-[22px] font-extrabold">
                    Ajouter une célébrité
                </DialogTitle>
                <DialogDescription className="text-[13px] text-ink-3">
                    {mode === 'search'
                        ? 'Cherchez sur Wikidata — naissance, décès et photo seront repris.'
                        : 'Saisie manuelle : un administrateur validera votre proposition.'}
                </DialogDescription>

                {mode === 'search' ? (
                    <SearchStep
                        pending={propose.isPending}
                        onPick={(c) => submit({ name: c.label, wikidataId: c.wikidataId })}
                        onManual={() => setMode('manual')}
                    />
                ) : (
                    <ManualStep
                        pending={propose.isPending}
                        onBack={() => setMode('search')}
                        onSubmit={submit}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface SearchStepProps {
    pending: boolean;
    onPick: (candidate: WikidataSummaryDto) => void;
    onManual: () => void;
}

function SearchStep({ pending, onPick, onManual }: SearchStepProps) {
    const [input, setInput] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        const id = setTimeout(() => setQuery(input), 300);
        return () => clearTimeout(id);
    }, [input]);

    const { data, isFetching, isError } = useWikidataSearch(query);

    return (
        <>
            <div className="mt-4 flex h-[46px] items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 px-3.5 focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30">
                <Search size={17} className="shrink-0 text-ink-3" />
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nom de la célébrité"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                />
            </div>

            <div className="mt-4 flex max-h-[320px] flex-col gap-2 overflow-y-auto">
                {isFetching && <p className="py-6 text-center text-sm text-ink-3">Recherche…</p>}
                {isError && (
                    <p className="py-6 text-center text-sm text-coral">
                        La recherche Wikidata a échoué.
                    </p>
                )}
                {!isFetching && !isError && query && data?.length === 0 && (
                    <p className="py-6 text-center text-sm text-ink-3">Aucun résultat.</p>
                )}
                {!isFetching &&
                    data?.map((c) => {
                        // A deceased person can't be a valid pick (they'd never score
                        // for the season). Keep it visible but greyed out + non-clickable.
                        const isDead = Boolean(c.death);
                        return (
                            <button
                                key={c.wikidataId}
                                type="button"
                                disabled={pending || isDead}
                                onClick={() => !isDead && onPick(c)}
                                className="flex items-start gap-3 rounded-xl border border-line-2 bg-surface px-3.5 py-3 text-left transition-colors hover:border-neon/40 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] border',
                                        c.isHuman
                                            ? 'border-neon/30 bg-neon/10 text-neon'
                                            : 'border-line bg-surface-3 text-ink-3',
                                    )}
                                >
                                    {c.isHuman ? <User size={16} /> : <Globe size={16} />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                        <span className="truncate text-[14.5px] font-semibold">
                                            {c.label}
                                        </span>
                                        <span className="shrink-0 font-mono text-[11px] text-ink-3">
                                            {c.wikidataId}
                                        </span>
                                        {isDead && (
                                            <span className="shrink-0 rounded-full border border-coral/40 bg-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral">
                                                Décédé(e)
                                            </span>
                                        )}
                                    </span>
                                    {c.description && (
                                        <span className="block truncate text-xs text-ink-3">
                                            {c.description}
                                        </span>
                                    )}
                                    <span className="mt-0.5 block font-mono text-[11px] text-ink-3">
                                        °{yearOf(c.birth)}
                                        {c.death ? ` — †${yearOf(c.death)}` : ''}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
            </div>

            <button
                type="button"
                onClick={onManual}
                className="mt-4 text-[13px] font-semibold text-neon hover:underline"
            >
                Je ne trouve pas — saisir manuellement
            </button>
        </>
    );
}

interface ManualStepProps {
    pending: boolean;
    onBack: () => void;
    onSubmit: (payload: ProposeCelebrityPayload) => void;
}

function ManualStep({ pending, onBack, onSubmit }: ManualStepProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [birth, setBirth] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSubmit({
            name: trimmed,
            role: role.trim() || undefined,
            // datetime-less date input → keep the date part only.
            birth: birth ? new Date(birth).toISOString() : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                Nom
                <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prénom Nom"
                    className="h-11 rounded-xl border border-line-2 bg-surface-2 px-3.5 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-neon/50 focus:ring-2 focus:ring-neon/30"
                />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                Métier <span className="font-normal text-ink-3">(optionnel)</span>
                <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Acteur, chanteuse…"
                    className="h-11 rounded-xl border border-line-2 bg-surface-2 px-3.5 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-neon/50 focus:ring-2 focus:ring-neon/30"
                />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2">
                Date de naissance <span className="font-normal text-ink-3">(optionnel)</span>
                <input
                    type="date"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    className="h-11 rounded-xl border border-line-2 bg-surface-2 px-3.5 text-[15px] text-ink outline-none focus:border-neon/50 focus:ring-2 focus:ring-neon/30"
                />
            </label>

            <div className="mt-2 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink"
                >
                    <ArrowLeft size={15} /> Retour
                </button>
                <button
                    type="submit"
                    disabled={pending || !name.trim()}
                    className="inline-flex h-10 items-center rounded-xl bg-neon px-4 text-[14px] font-bold text-neon-ink shadow-glow-soft transition-opacity disabled:opacity-50"
                >
                    {pending ? 'Ajout…' : 'Proposer'}
                </button>
            </div>
        </form>
    );
}
