import { Skull } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface DeadSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

/** "Décédé·e" toggle — turns coral when on; flipping it triggers point recalculation. */
export function DeadSwitch({ checked, onCheckedChange }: DeadSwitchProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl border p-3.5 transition-colors',
                checked
                    ? 'border-coral/35 bg-gradient-to-r from-coral/[0.06] to-surface'
                    : 'border-line bg-surface',
            )}
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-[10px] border transition-colors',
                    checked
                        ? 'border-coral/30 bg-coral/12 text-coral'
                        : 'border-line bg-surface-3 text-ink-2',
                )}
            >
                <Skull size={19} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold">Décédé·e</span>
                <span className="block text-xs text-ink-3">
                    Bascule la fiche et déclenche le recalcul des points
                </span>
            </span>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label="Marquer comme décédé·e"
                className="data-[state=checked]:bg-coral"
            />
        </div>
    );
}
