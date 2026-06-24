import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { usePushSubscription } from '@/lib/push/usePushSubscription';
import { SettingsRow } from './SettingsRow';

/** True on iOS Safari not yet installed to the home screen (push needs install). */
function isIosNeedsInstall(): boolean {
    if (typeof navigator === 'undefined') return false;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone =
        (navigator as Navigator & { standalone?: boolean }).standalone === true ||
        window.matchMedia?.('(display-mode: standalone)').matches;
    return isIos && !standalone;
}

/** The helper text under the toggle, depending on support / permission / state. */
function describeState(
    supported: boolean,
    permission: NotificationPermission,
    isSubscribed: boolean,
): string {
    if (!supported && isIosNeedsInstall()) {
        return "Ajoutez l'app à l'écran d'accueil pour les activer";
    }
    if (!supported) {
        return 'Non disponible sur cet appareil';
    }
    if (permission === 'denied') {
        return 'Autorisation bloquée dans le navigateur';
    }
    if (isSubscribed) {
        return 'Activées sur cet appareil';
    }
    return 'Recevez les alertes même quand l’app est fermée';
}

/** Account-settings row that toggles Web Push notifications for this device. */
export function PushNotificationsRow() {
    const { supported, permission, isSubscribed, isBusy, subscribe, unsubscribe } =
        usePushSubscription();

    const description = describeState(supported, permission, isSubscribed);
    const isDisabled = !supported || permission === 'denied';

    const handleToggle = async (checked: boolean) => {
        try {
            if (!checked) {
                await unsubscribe();
                toast.success('Notifications désactivées');
                return;
            }

            await subscribe();
            // subscribe() resolves without throwing even if permission was denied.
            if (Notification.permission === 'denied') {
                toast.error('Notifications refusées', {
                    description: 'Autorisez les notifications dans votre navigateur.',
                });
                return;
            }
            if (Notification.permission === 'granted') {
                toast.success('Notifications activées');
            }
        } catch (error) {
            // Surface the real cause: this is what lands in the console + toast.
            console.error('[push] toggle failed', error);
            const message = error instanceof Error ? error.message : String(error);
            toast.error('Impossible de mettre à jour les notifications', { description: message });
        }
    };

    return (
        <SettingsRow
            icon={Bell}
            title="Notifications push"
            description={description}
            disabled={isDisabled}
            control={
                <Switch
                    checked={isSubscribed}
                    disabled={isDisabled || isBusy}
                    onCheckedChange={handleToggle}
                    aria-label="Activer les notifications push"
                />
            }
        />
    );
}
