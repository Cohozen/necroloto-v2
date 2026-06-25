import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
            {...props}
        />
    );
}

export { Input };
