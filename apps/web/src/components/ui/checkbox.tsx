import { Check } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

/** Neon-themed checkbox (used for admin bulk selection). */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-[18px] shrink-0 cursor-pointer rounded-[6px] border border-line-2 bg-surface outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-neon/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-neon data-[state=checked]:bg-neon data-[state=checked]:text-neon-ink data-[state=indeterminate]:border-neon data-[state=indeterminate]:bg-neon data-[state=indeterminate]:text-neon-ink',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current"
            >
                <Check size={13} strokeWidth={3} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
