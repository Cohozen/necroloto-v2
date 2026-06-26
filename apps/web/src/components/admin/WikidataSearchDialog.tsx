import { Globe, Search, User } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useWikidataSearch } from '@/lib/api/queries';
import type { WikidataSummaryDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface WikidataSearchDialogProps {
    /** Initial query (the celebrity's current name). */
    initialQuery: string;
    onSelect: (candidate: WikidataSummaryDto) => void;
    children: ReactNode;
}

/** French year from an ISO date (or "?"). */
function yearOf(iso?: string): string {
    return iso ? String(new Date(iso).getUTCFullYear()) : '?';
}

/** Wikidata candidate picker — debounced search, click to enrich/prefill. */
export function WikidataSearchDialog({
    initialQuery,
    onSelect,
    children,
}: WikidataSearchDialogProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState(initialQuery);
    const [query, setQuery] = useState(initialQuery);

    // Re-seed the input each time the dialog opens.
    useEffect(() => {
        if (open) {
            setInput(initialQuery);
            setQuery(initialQuery);
        }
    }, [open, initialQuery]);

    // Debounce the query feeding the search hook.
    useEffect(() => {
        const id = setTimeout(() => setQuery(input), 300);
        return () => clearTimeout(id);
    }, [input]);

    const { data, isFetching, isError } = useWikidataSearch(open ? query : '');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[520px] gap-0 border-line bg-gradient-to-b from-surface-2 to-surface">
                <DialogTitle className="font-display text-[22px] font-extrabold">
                    Rechercher sur Wikidata
                </DialogTitle>
                <DialogDescription className="text-[13px] text-ink-3">
                    Choisissez une fiche : naissance, décès et photo seront repris.
                </DialogDescription>

                <div className="mt-4 flex h-[46px] items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 px-3.5 focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30">
                    <Search size={17} className="shrink-0 text-ink-3" />
                    <input
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nom de la célébrité"
                        className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                    />
                </div>

                <div className="mt-4 flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                    {isFetching && (
                        <p className="py-6 text-center text-sm text-ink-3">Recherche…</p>
                    )}
                    {isError && (
                        <p className="py-6 text-center text-sm text-coral">
                            La recherche Wikidata a échoué.
                        </p>
                    )}
                    {!isFetching && !isError && data?.length === 0 && (
                        <p className="py-6 text-center text-sm text-ink-3">Aucun résultat.</p>
                    )}
                    {!isFetching &&
                        data?.map((c) => (
                            <button
                                key={c.wikidataId}
                                type="button"
                                onClick={() => {
                                    onSelect(c);
                                    setOpen(false);
                                }}
                                className="flex items-start gap-3 rounded-xl border border-line-2 bg-surface px-3.5 py-3 text-left transition-colors hover:border-neon/40 hover:bg-surface-2"
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
                                    </span>
                                    {c.description && (
                                        <span className="block truncate text-xs text-ink-3">
                                            {c.description}
                                        </span>
                                    )}
                                    <span className="mt-0.5 block font-mono text-[11px] text-ink-3">
                                        {yearOf(c.birth)}
                                        {c.death ? ` — †${yearOf(c.death)}` : ''}
                                    </span>
                                </span>
                            </button>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
