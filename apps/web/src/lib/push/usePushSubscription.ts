import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '@/lib/api/context';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '';

/** Web Push is usable only with a SW, the Push API, and a configured VAPID key. */
export const isPushSupported = (): boolean =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    VAPID_PUBLIC_KEY.length > 0;

/** Converts a base64url VAPID key into the Uint8Array the Push API expects. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(normalized);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
}

export interface PushSubscriptionState {
    supported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isBusy: boolean;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

/**
 * Manages the browser's Web Push subscription: reflects the current state and
 * exposes subscribe/unsubscribe, syncing the subscription with the API
 * (`/push/subscribe`). `subscribe()` must be called from a user gesture (it
 * triggers the permission prompt).
 */
export function usePushSubscription(): PushSubscriptionState {
    const api = useApiClient();
    const supported = isPushSupported();
    const [permission, setPermission] = useState<NotificationPermission>(
        supported ? Notification.permission : 'denied',
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isBusy, setIsBusy] = useState(false);

    // Reflect the existing browser subscription on mount.
    useEffect(() => {
        if (!supported) return;
        let cancelled = false;
        navigator.serviceWorker.ready
            .then((reg) => reg.pushManager.getSubscription())
            .then((sub) => {
                if (!cancelled) setIsSubscribed(Boolean(sub));
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [supported]);

    const subscribe = useCallback(async () => {
        if (!supported) return;
        setIsBusy(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== 'granted') return;

            const reg = await navigator.serviceWorker.ready;
            const sub =
                (await reg.pushManager.getSubscription()) ??
                (await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
                }));

            await api.post('/push/subscribe', sub.toJSON());
            setIsSubscribed(true);
        } finally {
            setIsBusy(false);
        }
    }, [api, supported]);

    const unsubscribe = useCallback(async () => {
        if (!supported) return;
        setIsBusy(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await api.delete('/push/subscribe', { body: { endpoint: sub.endpoint } });
                await sub.unsubscribe();
            }
            setIsSubscribed(false);
        } finally {
            setIsBusy(false);
        }
    }, [api, supported]);

    return { supported, permission, isSubscribed, isBusy, subscribe, unsubscribe };
}
