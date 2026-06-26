import { Check, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FieldState = 'default' | 'ok' | 'error';

interface IconFieldProps {
    label: string;
    icon: LucideIcon;
    /** Controlled value (preferred). */
    value?: string;
    onChange?: (value: string) => void;
    /** Uncontrolled fallback. */
    defaultValue?: string;
    placeholder?: string;
    /** Native input type (e.g. "date", "text"). */
    type?: string;
    /** Char counter or hint shown next to the label. */
    sub?: string;
    state?: FieldState;
    /** Trailing adornment (badge, spinner) shown inside the input. */
    trailing?: ReactNode;
    /** Helper / validation line below the input. */
    message?: ReactNode;
    /** Display-only value (no editing) — for Wikidata-derived facts. */
    readOnly?: boolean;
}

const stateRing = {
    default:
        'border-line-2 focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30',
    ok: 'border-neon/50',
    error: 'border-coral/55',
} as const;

/** Labeled input with a leading icon and visual state (mirrors forms.js field/input). */
export function IconField({
    label,
    icon: Icon,
    value,
    onChange,
    defaultValue,
    placeholder,
    type = 'text',
    sub,
    state = 'default',
    trailing,
    message,
    readOnly,
}: IconFieldProps) {
    const controlled = onChange !== undefined;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2.5">
                <span className="text-[13px] font-semibold text-ink-2">{label}</span>
                {sub && <span className="font-mono text-[11px] text-ink-3">{sub}</span>}
            </div>
            <div
                className={cn(
                    'flex h-[50px] items-center gap-2.5 rounded-xl border bg-surface-2 px-3.5 transition-colors',
                    readOnly ? 'border-line-2 opacity-80' : stateRing[state],
                )}
            >
                <Icon size={18} className="shrink-0 text-ink-3" />
                <input
                    type={type}
                    readOnly={readOnly}
                    {...(readOnly
                        ? { value: value ?? '' }
                        : controlled
                          ? { value: value ?? '', onChange: (e) => onChange?.(e.target.value) }
                          : { defaultValue })}
                    placeholder={placeholder}
                    className={cn(
                        'min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 [color-scheme:dark]',
                        readOnly && 'cursor-default text-ink-2',
                    )}
                />
                {trailing}
                {state === 'ok' && !trailing && <Check size={18} className="shrink-0 text-neon" />}
            </div>
            {message}
        </div>
    );
}
