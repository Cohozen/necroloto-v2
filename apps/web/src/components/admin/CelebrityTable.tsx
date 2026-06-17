import { cn } from '@/lib/utils';
import type { AdminCelebrity } from '@/types/admin';
import { CATALOG_COLS, CelebrityRow } from './CelebrityRow';

/** Catalogue table — header + rows, horizontally scrollable on narrow screens. */
export function CelebrityTable({ celebrities }: { celebrities: AdminCelebrity[] }) {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-2xl border border-line bg-surface">
                <div
                    className={cn(
                        'grid px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3',
                        CATALOG_COLS,
                    )}
                >
                    <div />
                    <div>Nom</div>
                    <div>Naissance</div>
                    <div>Statut</div>
                    <div>Points</div>
                    <div>Paris</div>
                    <div className="text-right">Actions</div>
                </div>
                {celebrities.map((celeb) => (
                    <CelebrityRow key={celeb.id} celeb={celeb} />
                ))}
            </div>
        </div>
    );
}
