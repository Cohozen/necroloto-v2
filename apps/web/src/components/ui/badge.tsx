import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
                secondary: 'border-line-2 bg-surface-3 text-ink-2 [a&]:hover:bg-surface-2',
                destructive:
                    'bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90',
                outline:
                    'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
                // nl-status--alive
                alive: 'border-neon/40 bg-neon/10 font-bold uppercase tracking-[0.06em] text-neon',
                // nl-status--dead
                dead: 'border-coral/45 bg-coral/12 font-bold uppercase tracking-[0.06em] text-coral',
                // nl-score
                score: 'border-neon/40 bg-neon/10 font-bold text-neon shadow-glow-soft',
                // nl-streak
                streak: 'border-magenta/40 bg-magenta/12 font-bold text-magenta',
                ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 [a&]:hover:underline',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : 'span';

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
