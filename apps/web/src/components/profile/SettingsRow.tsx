import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    /** Coral-accented destructive row (logout, delete…). */
    danger?: boolean;
    /** Trailing control (e.g. a Switch). When set, the row is static, not a button. */
    control?: ReactNode;
    /** Click handler for actionable rows (ignored when `control` is set). */
    onClick?: () => void;
}

const rowBase = 'flex w-full items-center gap-3.5 px-4 py-[15px] text-left transition-colors';

/** Account settings list row (nl-listrow) — chevron by default, or a trailing control. */
export function SettingsRow({
    icon: Icon,
    title,
    description,
    danger,
    control,
    onClick,
}: SettingsRowProps) {
    const body = (
        <>
            <div
                className={cn(
                    'flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border',
                    danger
                        ? 'border-coral/25 bg-coral/10 text-coral'
                        : 'border-line bg-surface-3 text-ink-2',
                )}
            >
                <Icon size={17} />
            </div>
            <div className="min-w-0 flex-1">
                <div className={cn('text-[14.5px] font-semibold', danger && 'text-coral')}>
                    {title}
                </div>
                {description && <div className="mt-px text-xs text-ink-3">{description}</div>}
            </div>
            {control ?? <ChevronRight size={16} className="text-ink-3" />}
        </>
    );

    if (control) {
        return <div className={rowBase}>{body}</div>;
    }
    return (
        <button type="button" onClick={onClick} className={cn(rowBase, 'hover:bg-surface-2')}>
            {body}
        </button>
    );
}
