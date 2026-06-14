import type { AvatarPerson } from './user';

export type CircleVisibility = 'PRIVATE' | 'PUBLIC';

export interface CircleSummary {
    id: string;
    name: string;
    visibility: CircleVisibility;
    members: number;
    rank: number;
    points: number;
    isLeader: boolean;
    /** Top members shown as an avatar stack. */
    topMembers: AvatarPerson[];
}
