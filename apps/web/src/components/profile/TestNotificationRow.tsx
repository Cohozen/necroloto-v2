import { BellRing } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApiClient } from '@/lib/api/context';
import { SettingsRow } from './SettingsRow';

interface TestPushResult {
    enabled: boolean;
    subscriptions: number;
}

/** Admin-only row that fires a test push to the current user's own devices. */
export function TestNotificationRow() {
    const api = useApiClient();
    const [isSending, setIsSending] = useState(false);

    const handleClick = async () => {
        setIsSending(true);
        try {
            const result = await api.post<TestPushResult>('/push/test');

            if (!result.enabled) {
                toast.error('Push désactivé côté serveur', {
                    description: 'Les clés VAPID ne sont pas configurées sur l’API.',
                });
                return;
            }
            if (result.subscriptions === 0) {
                toast.warning('Aucun appareil abonné', {
                    description: 'Activez d’abord les notifications push sur cet appareil.',
                });
                return;
            }
            toast.success('Notification de test envoyée', {
                description: `Vers ${result.subscriptions} appareil(s).`,
            });
        } catch (error) {
            console.error('[push] test failed', error);
            const message = error instanceof Error ? error.message : String(error);
            toast.error('Échec de la notification de test', { description: message });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <SettingsRow
            icon={BellRing}
            title="Tester une notification"
            description="Envoie un push de test sur vos appareils"
            disabled={isSending}
            onClick={handleClick}
        />
    );
}
