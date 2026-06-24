import { registerSW } from 'virtual:pwa-register';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiClientProvider } from './lib/api/ApiClientProvider';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './lib/auth/clerk';
import { queryClient } from './lib/query';
import { routeTree } from './routeTree.gen';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/saira-condensed/600.css';
import '@fontsource/saira-condensed/700.css';
import '@fontsource/saira-condensed/800.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import './styles/globals.css';

// Register the PWA service worker (push + offline precaching). Auto-updates.
registerSW({ immediate: true });

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root introuvable');

const app = (
    <QueryClientProvider client={queryClient}>
        <ApiClientProvider>
            <RouterProvider router={router} />
        </ApiClientProvider>
    </QueryClientProvider>
);

createRoot(rootElement).render(
    <StrictMode>
        {isClerkConfigured ? (
            <ClerkProvider
                publishableKey={CLERK_PUBLISHABLE_KEY}
                afterSignOutUrl="/"
                signInUrl="/sign-in"
                signUpUrl="/sign-up"
                signInFallbackRedirectUrl="/dashboard"
                signUpFallbackRedirectUrl="/dashboard"
            >
                {app}
            </ClerkProvider>
        ) : (
            app
        )}
    </StrictMode>,
);
