import { Link } from '@tanstack/react-router';
import { Check, Eye, GitMerge, Globe, Pencil, RefreshCw, User, X } from 'lucide-react';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { AdminCelebrity } from '@/types/admin';
import { WikidataIndicator } from './WikidataIndicator';
import { WikidataSearchDialog } from './WikidataSearchDialog';

export const CATALOG_COLS = 'grid-cols-[34px_52px_minmax(0,1fr)_84px_184px_84px_72px_172px] gap-3';

interface CelebrityRowProps {
    celeb: AdminCelebrity;
    selected: boolean;
    onToggle: (id: string) => void;
    /** Approve a pending proposal (optionally with a Wikidata QID to enrich). */
    onApprove: (id: string, wikidataId?: string) => void;
    /** Reject a pending proposal. */
    onReject: (id: string) => void;
    /** Open the merge picker for this (duplicate) celebrity. */
    onMerge: (celeb: AdminCelebrity) => void;
    /** Disables actions while a mutation is in flight. */
    busy?: boolean;
}

/** One catalogue row — checkbox, portrait, identity, status, points, bettors, actions. */
export function CelebrityRow({
    celeb,
    selected,
    onToggle,
    onApprove,
    onReject,
    onMerge,
    busy,
}: CelebrityRowProps) {
    const dead = celeb.status === 'deceased';
    const pending = celeb.proposalStatus === 'pending';
    return (
        <div
            className={cn(
                'grid items-center border-t border-line px-3 py-2.5 transition-colors hover:bg-surface-2',
                selected && 'bg-neon/5',
                CATALOG_COLS,
            )}
        >
            <Checkbox
                checked={selected}
                onCheckedChange={() => onToggle(celeb.id)}
                aria-label={`Sélectionner ${celeb.name}`}
            />
            <CelebrityPortrait
                name={celeb.name}
                status={celeb.status}
                photo={celeb.photo}
                rounded="rounded-[11px]"
                className="size-11"
            />
            <div className="min-w-0">
                <div className="truncate text-[14.5px] font-semibold">{celeb.name}</div>
                <div className="truncate text-xs text-ink-3">{celeb.role}</div>
            </div>
            <div className="font-mono text-[13px] text-ink-2">{celeb.born}</div>
            <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={celeb.status} />
                {pending && (
                    <span className="inline-flex h-6 items-center rounded-full border border-coral/40 bg-coral/10 px-2 text-[11px] font-semibold text-coral">
                        En attente
                    </span>
                )}
                <WikidataIndicator linked={celeb.hasWikidata} />
            </div>
            <div>
                <span
                    className={cn(
                        'inline-flex h-7 items-center rounded-full px-2.5 text-[15px] font-bold',
                        dead
                            ? 'border border-coral/40 bg-coral/12 text-coral'
                            : 'bg-surface-3 text-ink',
                    )}
                >
                    {dead ? `+${celeb.points}` : celeb.points}
                </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-ink-2">
                <User size={14} className="text-ink-3" />
                {celeb.bettors}
            </div>
            <div className="flex items-center justify-end gap-1.5">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onMerge(celeb)}
                    aria-label="Fusionner"
                    className="inline-flex size-9 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink disabled:opacity-50"
                >
                    <GitMerge size={16} />
                </button>
                {pending ? (
                    <>
                        <WikidataSearchDialog
                            initialQuery={celeb.name}
                            onSelect={(c) => onApprove(celeb.id, c.wikidataId)}
                        >
                            <button
                                type="button"
                                disabled={busy}
                                aria-label="Vérifier sur Wikidata"
                                className="inline-flex size-9 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink disabled:opacity-50"
                            >
                                <Globe size={16} />
                            </button>
                        </WikidataSearchDialog>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReject(celeb.id)}
                            aria-label={`Rejeter ${celeb.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-coral/40 bg-coral/10 text-coral hover:bg-coral/15 disabled:opacity-50"
                        >
                            <X size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onApprove(celeb.id)}
                            aria-label={`Approuver ${celeb.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-neon/50 bg-neon/10 text-neon hover:bg-neon/15 disabled:opacity-50"
                        >
                            <Check size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/celebrities/$id"
                            params={{ id: celeb.id }}
                            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink"
                            aria-label={`Voir la fiche de ${celeb.name}`}
                        >
                            <Eye size={16} />
                        </Link>
                        <Link
                            to="/admin/celebrities/$id"
                            params={{ id: celeb.id }}
                            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink"
                            aria-label={`Éditer ${celeb.name}`}
                        >
                            <Pencil size={16} />
                        </Link>
                        <button
                            type="button"
                            aria-label="Recalculer les points"
                            className={cn(
                                'inline-flex size-9 items-center justify-center rounded-[10px] border bg-surface-2',
                                dead
                                    ? 'border-neon/40 text-neon'
                                    : 'border-line-2 text-ink-2 hover:text-ink',
                            )}
                        >
                            <RefreshCw size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
