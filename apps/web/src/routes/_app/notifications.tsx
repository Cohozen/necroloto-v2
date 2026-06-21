import { createFileRoute } from '@tanstack/react-router';
import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { EmptyArt } from '@/components/EmptyArt';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import {
    useClearNotifications,
    useDeleteNotification,
    useMarkNotificationsRead,
    useNotifications,
} from '@/lib/api/queries';

export const Route = createFileRoute('/_app/notifications')({
    component: Notifications,
});

function Notifications() {
    const { data: notifications, isLoading, isError } = useNotifications();
    const markRead = useMarkNotificationsRead();
    const deleteOne = useDeleteNotification();
    const clearAll = useClearNotifications();

    // Opening the page marks everything as read (clears the bell badge). Once.
    const marked = useRef(false);
    useEffect(() => {
        if (marked.current) return;
        marked.current = true;
        markRead.mutate();
    }, [markRead.mutate]);

    const handleDelete = (id: string) => {
        deleteOne.mutate(id, {
            onError: () => toast.error('La suppression a échoué.'),
        });
    };

    const handleClear = () => {
        clearAll.mutate(undefined, {
            onSuccess: () => toast.success('Notifications effacées.'),
            onError: () => toast.error("L'effacement a échoué."),
        });
    };

    const items = notifications ?? [];

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 md:p-6">
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <Bell size={20} className="text-neon" />
                    <h1 className="font-display text-2xl text-ink">Notifications</h1>
                </div>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={clearAll.isPending}
                        className="inline-flex items-center gap-1.5 rounded-[9px] border border-line-2 bg-surface-2 px-3 py-1.5 text-[12px] text-ink-2 transition-colors hover:text-ink disabled:opacity-50"
                    >
                        <CheckCheck size={14} />
                        Tout effacer
                    </button>
                )}
            </header>

            {isLoading && <p className="text-[13px] text-ink-3">Chargement…</p>}

            {isError && (
                <p className="text-[13px] text-coral">
                    Impossible de charger vos notifications. Réessayez plus tard.
                </p>
            )}

            {!isLoading && !isError && items.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <EmptyArt />
                    <div>
                        <p className="font-medium text-ink">Aucune notification</p>
                        <p className="mt-1 text-[13px] text-ink-3">
                            Vous serez prévenu·e ici des décès, des nouveaux membres et de la vie
                            des saisons.
                        </p>
                    </div>
                </div>
            )}

            {items.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    {items.map((notification) => (
                        <NotificationRow
                            key={notification.id}
                            notification={notification}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
