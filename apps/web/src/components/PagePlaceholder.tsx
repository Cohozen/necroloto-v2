interface PagePlaceholderProps {
    eyebrow: string;
    title: string;
    description: string;
}

/** Temporary on-theme placeholder until the real screen lands (Phase 4). */
export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-2 p-6 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                {eyebrow}
            </p>
            <h1 className="font-display text-4xl font-extrabold text-glow-neon">{title}</h1>
            <p className="text-ink-2">{description}</p>
        </div>
    );
}
