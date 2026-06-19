import { Hourglass, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CountdownTarget } from '@/lib/api/adapters';

interface CountdownCardProps {
    target: CountdownTarget;
}

interface Remaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
}

const MINUTE = 60_000;

function computeRemaining(deadline: number, now: number): Remaining {
    const diff = Math.max(0, deadline - now);
    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
        isPast: diff === 0,
    };
}

/** Countdown to a deadline, refreshed every minute. */
function useCountdown(deadline: number): Remaining {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), MINUTE);
        return () => clearInterval(id);
    }, []);
    return computeRemaining(deadline, now);
}

// Refreshed every minute, so seconds would sit stale — only show J/H/M.
const UNITS: { key: keyof Omit<Remaining, 'isPast'>; label: string }[] = [
    { key: 'days', label: 'Jours' },
    { key: 'hours', label: 'Heures' },
    { key: 'minutes', label: 'Min' },
];

/**
 * Neon countdown card: time left before the next season's bet window opens
 * (`opening`) or before the current one closes (`closing`).
 */
export function CountdownCard({ target }: CountdownCardProps) {
    const remaining = useCountdown(target.deadline);
    const isClosing = target.mode === 'closing';

    const accentText = isClosing ? 'text-coral' : 'text-neon';
    const accentGlow = isClosing ? 'shadow-glow-coral' : 'shadow-glow-soft';
    const badgeClass = isClosing
        ? 'border-coral/40 bg-coral/10 text-coral'
        : 'border-neon/40 bg-neon/10 text-neon';
    const title = isClosing ? 'Fin des paris' : 'Ouverture des paris';

    return (
        <div className="relative flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5">
            <div className="flex items-center justify-between gap-2.5">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                        {title}
                    </div>
                    <div className="mt-1 text-lg font-semibold">Saison {target.season.year}</div>
                </div>
                <span
                    className={`inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${badgeClass}`}
                >
                    {isClosing ? <Timer size={13} /> : <Hourglass size={13} />}
                    {isClosing ? 'à ne pas manquer' : 'bientôt'}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
                {UNITS.map(({ key, label }) => (
                    <div
                        key={key}
                        className={`flex flex-col items-center gap-1 rounded-xl border border-line bg-surface-3 px-2 py-3 ${accentGlow}`}
                    >
                        <span
                            className={`font-display text-3xl font-extrabold leading-none ${accentText}`}
                        >
                            {String(remaining[key]).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-ink-3">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
