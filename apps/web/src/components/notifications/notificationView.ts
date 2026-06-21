import { CalendarCheck, CalendarClock, Flag, type LucideIcon, Skull, UserPlus } from 'lucide-react';
import type { NotificationType } from '@/lib/api/types';

export type NotificationTone = 'neon' | 'coral' | 'magenta';

interface NotificationView {
    icon: LucideIcon;
    tone: NotificationTone;
}

/** Icon + accent tone for a notification type (drives the row's left badge). */
const VIEW: Record<NotificationType, NotificationView> = {
    CELEBRITY_DEATH: { icon: Skull, tone: 'coral' },
    CIRCLE_NEW_MEMBER: { icon: UserPlus, tone: 'neon' },
    SEASON_BETS_OPEN: { icon: CalendarClock, tone: 'magenta' },
    SEASON_OPENED: { icon: CalendarCheck, tone: 'neon' },
    SEASON_CLOSED: { icon: Flag, tone: 'coral' },
};

export function notificationView(type: NotificationType): NotificationView {
    return VIEW[type] ?? { icon: Flag, tone: 'neon' };
}

/** Tailwind classes for the tone's icon color + faint tinted background. */
export const TONE_CLASSES: Record<NotificationTone, { text: string; bg: string }> = {
    neon: { text: 'text-neon', bg: 'bg-neon/10' },
    coral: { text: 'text-coral', bg: 'bg-coral/10' },
    magenta: { text: 'text-magenta', bg: 'bg-magenta/10' },
};
