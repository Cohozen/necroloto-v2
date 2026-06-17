import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraftTrayProps {
    selected: number;
    total: number;
    onValidate?: () => void;
    /** Disables the validate action (e.g. empty selection or no circle). */
    disabled?: boolean;
    /** Shows a pending label while the bet is being saved. */
    saving?: boolean;
}

/** Sticky draft summary with the selection count and validate action (nl tray). */
export function DraftTray({ selected, total, onValidate, disabled, saving }: DraftTrayProps) {
    const remaining = Math.max(total - selected, 0);
    return (
        <div className="sticky bottom-4 z-10 mt-2 flex items-center gap-4 rounded-2xl border border-neon/40 bg-bg/85 p-3 px-4 shadow-glow-green backdrop-blur-md">
            <div className="font-display text-3xl font-extrabold leading-none text-glow-neon">
                {selected}
                <span className="text-[0.62em] text-ink-3"> / {total}</span>
            </div>
            <div className="min-w-0">
                <div className="text-[13px] font-bold">Brouillon enregistré</div>
                <div className="truncate text-[11px] text-ink-3">
                    {remaining > 0 ? `il reste ${remaining} choix` : 'liste complète'}
                </div>
            </div>
            <div className="flex-1" />
            <Button onClick={onValidate} disabled={disabled} className="shrink-0">
                <Check size={16} strokeWidth={2.4} />{' '}
                {saving ? 'Enregistrement…' : 'Valider mon pari'}
            </Button>
        </div>
    );
}
