import type { LucideIcon } from 'lucide-react';

/** Accent tone shared by stat tiles and achievement badges. */
export type ProfileTone = 'default' | 'coral' | 'mag';

export interface PlayerProfile {
    name: string;
    handle: string;
    initials: string;
    /** Best rank across circles, pre-formatted (e.g. "#2"). */
    rank: string;
    streak: number;
    /** Membership start, pre-formatted (e.g. "déc. 2024"). */
    joinedLabel: string;
}

export interface PlayerStat {
    id: string;
    icon: LucideIcon;
    value: string;
    label: string;
    tone?: ProfileTone;
    /** Optional pill, e.g. a weekly delta. */
    chip?: string;
}

export interface Achievement {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    tone?: ProfileTone;
    locked?: boolean;
}
