import { Link } from '@tanstack/react-router';
import { Check, Eye, GitMerge, Globe, Pencil, RefreshCw, User, X } from 'lucide-react';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { AdminCelebrity } from '@/types/admin';
import { WikidataIndicator } from './WikidataIndicator';
import { WikidataSearchDialog } from './WikidataSearchDialog';

interface CelebrityCardProps {
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

/** Mobile catalogue card — same data as a table row, stacked with large touch targets. */
export function CelebrityCard({
    celeb,
    selected,
    onToggle,
    onApprove,
    onReject,
    onMerge,
    busy,
}: CelebrityCardProps) {
    const dead = celeb.status === 'deceased';
    const pending = celeb.proposalStatus === 'pending';
    return (
        <div
            className={cn(
                'rounded-2xl border border-line bg-surface p-3.5 transition-colors',
                selected && 'border-neon/40 bg-neon/5',
            )}
        >
            <div className="flex items-center gap-3">
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
                    className="size-12"
                />
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold">{celeb.name}</div>
                    <div className="truncate text-xs text-ink-3">{celeb.role}</div>
                </div>
                <span
                    className={cn(
                        'inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[15px] font-bold',
                        dead
                            ? 'border border-coral/40 bg-coral/12 text-coral'
                            : 'bg-surface-3 text-ink',
                    )}
                >
                    {dead ? `+${celeb.points}` : celeb.points}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={celeb.status} gender={celeb.gender} />
                {pending && (
                    <span className="inline-flex h-6 items-center rounded-full border border-coral/40 bg-coral/10 px-2 text-[11px] font-semibold text-coral">
                        En attente
                    </span>
                )}
                <WikidataIndicator linked={celeb.hasWikidata} />
                <span className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-ink-2">
                    <span className="inline-flex items-center gap-1.5">
                        <User size={14} className="text-ink-3" />
                        {celeb.bettors}
                    </span>
                    <span className="font-mono text-[13px] font-medium text-ink-3">
                        °{celeb.born}
                    </span>
                </span>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
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
                                className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink disabled:opacity-50"
                            >
                                <Globe size={18} />
                            </button>
                        </WikidataSearchDialog>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onMerge(celeb)}
                            aria-label="Fusionner"
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink disabled:opacity-50"
                        >
                            <GitMerge size={18} />
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReject(celeb.id)}
                            aria-label={`Rejeter ${celeb.name}`}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-coral/40 bg-coral/10 text-[13px] font-semibold text-coral hover:bg-coral/15 disabled:opacity-50"
                        >
                            <X size={16} /> Rejeter
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onApprove(celeb.id)}
                            aria-label={`Approuver ${celeb.name}`}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-neon/50 bg-neon/10 text-[13px] font-semibold text-neon hover:bg-neon/15 disabled:opacity-50"
                        >
                            <Check size={16} /> Approuver
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/celebrities/$id"
                            params={{ id: celeb.id }}
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-line-2 bg-surface-2 text-ink-2 hover:text-ink"
                            aria-label={`Voir la fiche de ${celeb.name}`}
                        >
                            <Eye size={18} />
                        </Link>
                        <Link
                            to="/admin/celebrities/$id"
                            params={{ id: celeb.id }}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-line-2 bg-surface-2 text-[13px] font-semibold text-ink-2 hover:text-ink"
                            aria-label={`Éditer ${celeb.name}`}
                        >
                            <Pencil size={16} /> Éditer
                        </Link>
                        <button
                            type="button"
                            aria-label="Recalculer les points"
                            className={cn(
                                'inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border bg-surface-2',
                                dead
                                    ? 'border-neon/40 text-neon'
                                    : 'border-line-2 text-ink-2 hover:text-ink',
                            )}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
