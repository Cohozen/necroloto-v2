import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

/** Dashed "one more circle?" hint card closing the hub grid. */
export function GhostAddCard() {
    return (
        <Link
            to="/circles/new"
            className="flex min-h-[230px] flex-col items-center justify-center gap-3.5 rounded-2xl border-[1.5px] border-dashed border-line-2 bg-white/[0.012] text-ink-3 transition-colors hover:border-neon/40 hover:text-ink-2"
        >
            <span className="flex size-[74px] items-center justify-center rounded-full [background:radial-gradient(circle_at_50%_38%,rgb(var(--neon-rgb)/0.16),transparent_62%)] text-neon">
                <Plus size={26} strokeWidth={2} />
            </span>
            <div className="text-center">
                <div className="font-bold text-ink-2">Un cercle de plus ?</div>
                <div className="mt-0.5 text-xs">Créez-en un ou entrez un code</div>
            </div>
        </Link>
    );
}
