import { cn } from '@/lib/utils';
import type { CelebrityStatus } from '@/types/celebrity';

// Deterministic gradient pairs so each celebrity looks distinct (nl-portrait).
const GRADIENTS: [string, string][] = [
    ['#3388cc', '#114433'],
    ['#aa33bb', '#332266'],
    ['#2bd4ff', '#11aa66'],
    ['#ff8833', '#661122'],
    ['#33aa88', '#113344'],
];

function gradientFor(name: string) {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return GRADIENTS[hash % GRADIENTS.length];
}

interface CelebrityPortraitProps {
    name: string;
    status: CelebrityStatus;
    /** Portrait URL — when set, rendered over the gradient; falls back to the monogram. */
    photo?: string | null;
    /** Tailwind rounding class, e.g. 'rounded-2xl' or 'rounded-none'. */
    rounded?: string;
    className?: string;
}

/** Monogram portrait placeholder with a neon scrim; deceased = desaturated + coral wash. */
export function CelebrityPortrait({
    name,
    status,
    photo,
    rounded = 'rounded-2xl',
    className,
}: CelebrityPortraitProps) {
    const [from, to] = gradientFor(name);
    const dead = status === 'deceased';
    return (
        <div
            className={cn(
                '@container relative flex items-end justify-center overflow-hidden',
                rounded,
                dead && 'brightness-[0.62] grayscale-[0.85]',
                className,
            )}
            style={{
                backgroundImage: `radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(160deg, ${from}, ${to})`,
            }}
            aria-hidden="true"
        >
            {photo ? (
                <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
                <span className="-mb-[4%] font-display text-[40cqi] font-extrabold leading-none text-white/90 mix-blend-soft-light">
                    {name.charAt(0).toUpperCase()}
                </span>
            )}
            {dead && (
                <span className="absolute inset-0 bg-gradient-to-b from-transparent to-coral/30 mix-blend-screen" />
            )}
            <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]" />
        </div>
    );
}
