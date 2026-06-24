/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

// Custom service worker for Necroloto: Workbox precaching (injected manifest)
// plus Web Push handlers. Built via vite-plugin-pwa `injectManifest`.

declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST);

// Activate the updated SW immediately (paired with registerType: 'autoUpdate').
self.skipWaiting();
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

interface PushPayload {
    title: string;
    body: string;
    url?: string;
    data?: Record<string, unknown>;
}

self.addEventListener('push', (event) => {
    let payload: PushPayload = { title: 'Necroloto', body: 'Vous avez une nouvelle notification.' };
    try {
        if (event.data) payload = { ...payload, ...(event.data.json() as PushPayload) };
    } catch {
        if (event.data) payload.body = event.data.text();
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/pwa-192.png',
            badge: '/favicon-32.png',
            data: { url: payload.url ?? '/notifications', ...payload.data },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data?.url as string | undefined) ?? '/notifications';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Focus an existing tab if one is already open, else open a new one.
            for (const client of clients) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return self.clients.openWindow(url);
        }),
    );
});
