import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { relativeDayLabel } from '@/lib/api/adapters';
import type { ApiNotification } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { notificationView, TONE_CLASSES } from './notificationView';

interface NotificationRowProps {
    notification: ApiNotification;
    onDelete: (id: string) => void;
}

/**
 * Where a notification navigates when clicked. Prefers a specific entity from
 * its payload (celebrity fiche / circle), else falls back per type: betting
 * opening → the bet draft, season open/close → the leaderboard hub.
 */
function targetFor(notification: ApiNotification): string {
    const { celebrityId, circleId } = notification.data ?? {};
    if (celebrityId) return `/celebrities/${celebrityId}`;
    if (circleId) return `/circles/${circleId}`;
    switch (notification.type) {
        case 'SEASON_BETS_OPEN':
            return '/celebrities';
        case 'SEASON_OPENED':
        case 'SEASON_CLOSED':
            return '/circles';
        default:
            return '/dashboard';
    }
}

export function NotificationRow({ notification, onDelete }: NotificationRowProps) {
    const navigate = useNavigate();
    const { icon: Icon, tone } = notificationView(notification.type);
    const toneClass = TONE_CLASSES[tone];
    const target = targetFor(notification);
    const unread = !notification.readAt;

    const body = (
        <>
            <span
                className={cn(
                    'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[11px]',
                    toneClass.bg,
                    toneClass.text,
                )}
            >
                <Icon size={18} />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                    {unread && <span className="size-2 shrink-0 rounded-full bg-neon" />}
                    <span className="truncate font-medium text-[14px] text-ink">
                        {notification.title}
                    </span>
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-2">{notification.body}</span>
                <span className="mt-1 block text-[11px] text-ink-3">
                    {relativeDayLabel(notification.createdAt)}
                </span>
            </span>
        </>
    );

    return (
        <div className="group flex items-start gap-3.5 rounded-[13px] border border-line bg-surface p-3.5 transition-colors focus-within:border-line-2 hover:border-line-2">
            <button
                type="button"
                className="flex flex-1 cursor-pointer items-start gap-3.5 text-left"
                onClick={() => navigate({ to: target })}
            >
                {body}
            </button>

            <button
                type="button"
                aria-label="Supprimer la notification"
                className="shrink-0 rounded-[9px] p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-coral"
                onClick={() => onDelete(notification.id)}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
