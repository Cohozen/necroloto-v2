import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
    n: string;
    icon: LucideIcon;
    title: string;
    body: string;
    tag: ReactNode;
    tone: 'neon' | 'mag' | 'coral';
}

const badgeTone = {
    neon: 'bg-neon text-neon-ink',
    mag: 'bg-magenta text-white',
    coral: 'bg-coral text-[#1c0a06]',
} as const;

/** One "how it works" step (lp-step) — numbered badge, corner icon, copy, tag. */
export function StepCard({ n, icon: Icon, title, body, tag, tone }: StepCardProps) {
    return (
        <article className="relative overflow-hidden rounded-[18px] border border-line bg-gradient-to-b from-surface-2 to-surface p-6">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />
            <span
                className={cn(
                    'inline-flex size-10 items-center justify-center rounded-[12px] font-arcade text-[15px] font-bold shadow-glow-soft',
                    badgeTone[tone],
                )}
            >
                {n}
            </span>
            <Icon size={22} className="absolute right-5 top-5 text-ink-3" />
            <h3 className="mt-4 text-[19px] font-bold tracking-[-0.01em]">{title}</h3>
            <p className="mt-[7px] text-[14.5px] text-ink-2">{body}</p>
            <div className="mt-3.5">{tag}</div>
        </article>
    );
}
