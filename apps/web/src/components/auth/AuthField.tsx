import { Check, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type FieldState = 'default' | 'ok' | 'error';

interface AuthFieldProps {
    label: string;
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    /** Native input type. For "password", a show/hide toggle is added automatically. */
    type?: string;
    placeholder?: string;
    state?: FieldState;
    autoComplete?: string;
    /** Helper / validation line below the input. */
    message?: ReactNode;
}

const stateRing = {
    default:
        'border-line-2 focus-within:border-neon/50 focus-within:ring-2 focus-within:ring-neon/30',
    ok: 'border-neon/50',
    error: 'border-coral/55',
} as const;

/**
 * Labeled input with a leading icon, neon focus ring and visual state — the auth
 * counterpart of admin/IconField, with a built-in reveal toggle for passwords.
 * Ported from the field markup in docs/mockups/screens/auth.js.
 */
export function AuthField({
    label,
    icon: Icon,
    value,
    onChange,
    type = 'text',
    placeholder,
    state = 'default',
    autoComplete,
    message,
}: AuthFieldProps) {
    const isPassword = type === 'password';
    const [revealed, setRevealed] = useState(false);
    const effectiveType = isPassword && revealed ? 'text' : type;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-ink-2">{label}</span>
            <div
                className={cn(
                    'flex h-[50px] items-center gap-2.5 rounded-xl border bg-surface-2 px-3.5 transition-colors',
                    stateRing[state],
                )}
            >
                <Icon size={18} className="shrink-0 text-ink-3" />
                <input
                    type={effectiveType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 [color-scheme:dark]"
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setRevealed((v) => !v)}
                        aria-label={
                            revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                        }
                        className="shrink-0 text-ink-3 transition-colors hover:text-ink-2"
                    >
                        {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                ) : (
                    state === 'ok' && <Check size={18} className="shrink-0 text-neon" />
                )}
            </div>
            {message}
        </div>
    );
}
