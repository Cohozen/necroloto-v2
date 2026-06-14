import type { SignIn } from '@clerk/clerk-react';
import type { ComponentProps } from 'react';

type ClerkAppearance = NonNullable<ComponentProps<typeof SignIn>['appearance']>;

/**
 * Neon / arcade theme for Clerk's <SignIn> / <SignUp>.
 *
 * The Clerk engine is untouched — only its `appearance` is mapped to Necroloto
 * tokens (see docs/mockups/screens/auth.js, the "thème Clerk" board). The card
 * chrome (gradient + toprule) is provided by <AuthLayout>, so Clerk's own card
 * is made transparent here and we only theme its inner elements.
 */
export const clerkAppearance: ClerkAppearance = {
    variables: {
        colorPrimary: '#39ff6a',
        colorText: '#f3f4f8',
        colorTextSecondary: '#9b9cac',
        colorBackground: '#14141c',
        colorInputBackground: '#1a1a24',
        colorInputText: '#f3f4f8',
        colorDanger: '#ff5a3c',
        colorSuccess: '#39ff6a',
        borderRadius: '12px',
        fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    },
    elements: {
        // <AuthLayout> owns the card chrome — let Clerk's card blend into it.
        rootBox: 'w-full',
        cardBox: 'w-full shadow-none',
        card: 'bg-transparent border-0 shadow-none p-0 gap-5',
        logoBox: 'hidden',
        headerTitle: 'font-display text-3xl font-extrabold tracking-[0.01em]',
        headerSubtitle: 'text-ink-2',
        socialButtonsBlockButton: 'h-[50px] bg-surface-3 border-line-2 text-ink hover:bg-surface-2',
        socialButtonsBlockButtonText: 'font-semibold',
        dividerLine: 'bg-line',
        dividerText: 'text-ink-3 uppercase tracking-[0.16em] text-[11px] font-bold',
        formFieldLabel: 'text-ink-2 font-semibold',
        formFieldInput:
            'h-[50px] bg-surface-2 border-line-2 focus:border-neon/50 focus:ring-2 focus:ring-neon/30',
        formButtonPrimary:
            'h-[52px] bg-neon text-neon-ink text-[15px] font-bold normal-case shadow-glow-soft hover:brightness-110 active:brightness-95',
        footerActionText: 'text-ink-3',
        footerActionLink: 'text-neon font-bold hover:text-neon hover:brightness-110',
    },
};
