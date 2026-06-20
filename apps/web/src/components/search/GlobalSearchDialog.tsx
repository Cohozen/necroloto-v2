import { useNavigate } from '@tanstack/react-router';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useCelebritySearch, useCircleSearch } from '@/lib/api/queries';
import { CelebrityPortrait } from '../celebrities/CelebrityPortrait';

interface GlobalSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MAX_PER_GROUP = 6;

/**
 * Global search palette (⌘K): name search over the viewer's circles + public
 * circles and the celebrity catalogue. Keyboard-navigable (cmdk), redirects to
 * the circle leaderboard or the celebrity fiche. Search is server-side, so cmdk's
 * own filtering is disabled (`shouldFilter={false}`).
 */
export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');

    // Reset when the dialog closes so it reopens fresh.
    useEffect(() => {
        if (!open) {
            setQuery('');
            setDebounced('');
        }
    }, [open]);

    // Debounce the query feeding the search hooks (~250ms).
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 250);
        return () => clearTimeout(t);
    }, [query]);

    const circles = useCircleSearch(debounced);
    const celebrities = useCelebritySearch(debounced);

    const circleHits = (circles.data ?? []).slice(0, MAX_PER_GROUP);
    const celebrityHits = (celebrities.data ?? []).slice(0, MAX_PER_GROUP);

    const hasQuery = debounced.trim().length > 0;
    const isLoading = hasQuery && (circles.isFetching || celebrities.isFetching);
    const isEmpty = hasQuery && !isLoading && circleHits.length === 0 && celebrityHits.length === 0;

    function go(to: '/circles/$id' | '/celebrities/$id', id: string) {
        onOpenChange(false);
        navigate({ to, params: { id } });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="overflow-hidden border-line bg-gradient-to-b from-surface-2 to-surface p-0"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Recherche globale</DialogTitle>
                <DialogDescription className="sr-only">
                    Rechercher une célébrité ou un cercle.
                </DialogDescription>
                <Command
                    shouldFilter={false}
                    className="bg-transparent [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-ink-3"
                >
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Rechercher une célébrité, un cercle…"
                    />
                    <CommandList className="max-h-[360px]">
                        {!hasQuery && (
                            <p className="px-3 py-6 text-center text-[13px] text-ink-3">
                                Tapez pour rechercher un cercle ou une célébrité.
                            </p>
                        )}
                        {isLoading && (
                            <p className="px-3 py-6 text-center text-[13px] text-ink-3">
                                Recherche…
                            </p>
                        )}
                        {isEmpty && <CommandEmpty>Aucun résultat.</CommandEmpty>}

                        {circleHits.length > 0 && (
                            <CommandGroup heading="Cercles">
                                {circleHits.map((circle) => (
                                    <CommandItem
                                        key={circle.id}
                                        value={`circle-${circle.id}`}
                                        onSelect={() => go('/circles/$id', circle.id)}
                                        className="gap-3"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-surface-3 text-ink-2">
                                            <Users size={16} />
                                        </span>
                                        <span className="min-w-0 flex-1 truncate font-medium text-ink">
                                            {circle.name}
                                        </span>
                                        <span className="shrink-0 text-[11px] text-ink-3">
                                            {circle.isMember
                                                ? 'Membre'
                                                : circle.visibility === 'PUBLIC'
                                                  ? 'Public'
                                                  : 'Privé'}
                                            {' · '}
                                            {circle.members}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {celebrityHits.length > 0 && (
                            <CommandGroup heading="Célébrités">
                                {celebrityHits.map((celebrity) => (
                                    <CommandItem
                                        key={celebrity.id}
                                        value={`celebrity-${celebrity.id}`}
                                        onSelect={() => go('/celebrities/$id', celebrity.id)}
                                        className="gap-3"
                                    >
                                        <CelebrityPortrait
                                            name={celebrity.name}
                                            status={celebrity.death ? 'deceased' : 'alive'}
                                            photo={celebrity.photo}
                                            rounded="rounded-xl"
                                            className="size-9 shrink-0"
                                        />
                                        <span className="min-w-0 flex-1 truncate font-medium text-ink">
                                            {celebrity.name}
                                        </span>
                                        {celebrity.role && (
                                            <span className="shrink-0 truncate text-[11px] text-ink-3">
                                                {celebrity.role}
                                            </span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
