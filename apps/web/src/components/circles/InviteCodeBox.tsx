import { Check, Copy, Hash, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

/** Invite-code panel (nl-codebox) — code, copy, regenerate / revoke. */
export function InviteCodeBox({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard unavailable (e.g. insecure context) — silently ignore.
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-ink-2">Code d'invitation</span>
            <div className="flex items-center gap-3.5 rounded-[15px] border border-neon/40 bg-gradient-to-r from-neon/12 to-surface px-4 py-3.5 shadow-glow-soft">
                <Hash size={22} className="shrink-0 text-neon" />
                <span className="flex-1 font-display text-[26px] font-extrabold tracking-[0.22em] text-neon sm:text-[30px]">
                    {code}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copier le code"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line-2 bg-surface-2 text-neon"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-neon/45 bg-transparent px-3 text-[13px] font-semibold text-neon hover:bg-neon/10"
                >
                    <RefreshCw size={15} strokeWidth={2} /> Régénérer
                </button>
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-semibold text-ink-2 hover:text-ink"
                >
                    <X size={15} strokeWidth={2} /> Révoquer
                </button>
                <span className="ml-auto text-xs text-ink-3">Valable toute la saison</span>
            </div>
        </div>
    );
}
