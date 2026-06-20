import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { AdminCelebrity } from '@/types/admin';
import { CATALOG_COLS, CelebrityRow } from './CelebrityRow';

interface CelebrityTableProps {
    celebrities: AdminCelebrity[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onToggleAll: () => void;
    onApprove: (id: string, wikidataId?: string) => void;
    onReject: (id: string) => void;
    onMerge: (celeb: AdminCelebrity) => void;
    /** Id of the celebrity currently mutating (disables its row actions). */
    busyId?: string | null;
}

/** Catalogue table — header + rows, horizontally scrollable on narrow screens. */
export function CelebrityTable({
    celebrities,
    selectedIds,
    onToggle,
    onToggleAll,
    onApprove,
    onReject,
    onMerge,
    busyId,
}: CelebrityTableProps) {
    const selectedOnPage = celebrities.filter((c) => selectedIds.has(c.id)).length;
    const allSelected = celebrities.length > 0 && selectedOnPage === celebrities.length;
    const someSelected = selectedOnPage > 0 && !allSelected;

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[760px] overflow-hidden rounded-2xl border border-line bg-surface">
                <div
                    className={cn(
                        'grid items-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3',
                        CATALOG_COLS,
                    )}
                >
                    <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={onToggleAll}
                        aria-label="Tout sélectionner"
                    />
                    <div />
                    <div>Nom</div>
                    <div>Naissance</div>
                    <div>Statut</div>
                    <div>Points</div>
                    <div>Paris</div>
                    <div className="text-right">Actions</div>
                </div>
                {celebrities.map((celeb) => (
                    <CelebrityRow
                        key={celeb.id}
                        celeb={celeb}
                        selected={selectedIds.has(celeb.id)}
                        onToggle={onToggle}
                        onApprove={onApprove}
                        onReject={onReject}
                        onMerge={onMerge}
                        busy={busyId === celeb.id}
                    />
                ))}
            </div>
        </div>
    );
}
