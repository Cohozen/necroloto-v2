import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[11px] text-sm font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-neon/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                // nl-btn-primary: neon fill + glow
                default:
                    'bg-primary font-bold text-primary-foreground shadow-glow-soft hover:brightness-110 active:brightness-95',
                destructive:
                    'bg-destructive font-bold text-destructive-foreground shadow-glow-coral hover:brightness-110',
                // nl-btn-ghost: neon outline
                outline: 'border border-neon/45 bg-transparent text-neon hover:bg-neon/10',
                // nl-btn: neutral surface
                secondary: 'border border-line-2 bg-surface-3 text-ink hover:bg-surface-2',
                ghost: 'text-ink-2 hover:bg-surface hover:text-ink',
                link: 'text-neon underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-[42px] px-[18px] has-[>svg]:px-4',
                xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: 'h-[34px] gap-1.5 rounded-[9px] px-[13px] text-[13px] has-[>svg]:px-2.5',
                lg: 'h-[50px] rounded-xl px-7 text-[15px] has-[>svg]:px-5',
                icon: 'size-[42px]',
                'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
                'icon-sm': 'size-[34px] rounded-[9px]',
                'icon-lg': 'size-[50px] rounded-xl',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
