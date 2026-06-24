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

/** Account-settings row that toggles Web Push notifications for this device. */
export function PushNotificationsRow() {
    const { supported, permission, isSubscribed, isBusy, subscribe, unsubscribe } =
        usePushSubscription();

    const description = !supported
        ? isIosNeedsInstall()
            ? "Ajoutez l'app à l'écran d'accueil pour les activer"
            : 'Non disponible sur cet appareil'
        : permission === 'denied'
          ? 'Autorisation bloquée dans le navigateur'
          : isSubscribed
            ? 'Activées sur cet appareil'
            : 'Recevez les alertes même quand l’app est fermée';

    const handleToggle = async (checked: boolean) => {
        try {
            if (checked) {
                await subscribe();
                // subscribe() resolves without throwing even if permission was denied.
                if (Notification.permission === 'denied') {
                    toast.error('Notifications refusées', {
                        description: 'Autorisez les notifications dans votre navigateur.',
                    });
                } else if (Notification.permission === 'granted') {
                    toast.success('Notifications activées');
                }
            } else {
                await unsubscribe();
                toast.success('Notifications désactivées');
            }
        } catch {
            toast.error('Impossible de mettre à jour les notifications');
        }
    };

    return (
        <SettingsRow
            icon={Bell}
            title="Notifications push"
            description={description}
            disabled={!supported || permission === 'denied'}
            control={
                <Switch
                    checked={isSubscribed}
                    disabled={!supported || isBusy || permission === 'denied'}
                    onCheckedChange={handleToggle}
                    aria-label="Activer les notifications push"
                />
            }
        />
    );
}
