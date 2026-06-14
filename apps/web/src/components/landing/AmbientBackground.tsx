/** Fixed ambient depth behind the landing page — glow orbs, faint grid, grain. */
export function AmbientBackground() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* masked grid, fading toward the bottom */}
            <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(120%_80%_at_50%_0%,#000_30%,transparent_78%)]" />
            {/* glow orbs */}
            <div className="absolute -right-[120px] -top-[160px] size-[620px] rounded-full blur-[80px] [background:radial-gradient(circle,rgb(var(--neon-rgb)/0.22),transparent_68%)]" />
            <div className="absolute -left-[220px] top-[38%] size-[560px] rounded-full blur-[80px] [background:radial-gradient(circle,rgb(var(--magenta-rgb)/0.16),transparent_68%)]" />
            <div className="absolute -bottom-[240px] right-[8%] size-[560px] rounded-full blur-[80px] [background:radial-gradient(circle,rgb(var(--coral-rgb)/0.12),transparent_68%)]" />
        </div>
    );
}
