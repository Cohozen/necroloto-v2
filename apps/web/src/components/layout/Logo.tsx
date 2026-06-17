import { cn } from '@/lib/utils';

// Classic 11×8 pixel "space invader" — the Necroloto brand mark.
const INVADER = [
    '00100000100',
    '00010001000',
    '00111111100',
    '01101110110',
    '11111111111',
    '10111111101',
    '10100000101',
    '00011011000',
];
const COLS = INVADER[0].length;
const ROWS = INVADER.length;
// Filled cells as fixed coordinates (keys are positions, not loop indices).
const CELLS = INVADER.flatMap((line, y) =>
    line.split('').flatMap((c, x) => (c === '1' ? [{ x, y }] : [])),
);

interface LogoProps {
    /** Pixel size of one invader cell. */
    cell?: number;
    /** Show the "Necroloto" wordmark next to the mark. */
    withWord?: boolean;
    className?: string;
}

export function Logo({ cell = 3, withWord = false, className }: LogoProps) {
    return (
        <span className={cn('flex items-center gap-2.5', className)}>
            <svg
                width={COLS * cell}
                height={ROWS * cell}
                viewBox={`0 0 ${COLS} ${ROWS}`}
                fill="currentColor"
                className="text-neon drop-shadow-[0_0_8px_rgb(var(--neon-rgb)/0.7)]"
                aria-hidden="true"
            >
                {CELLS.map(({ x, y }) => (
                    <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
                ))}
            </svg>
            {withWord && (
                <span className="font-arcade text-xl leading-none tracking-wide">
                    Necro<span className="text-neon">loto</span>
                </span>
            )}
        </span>
    );
}
