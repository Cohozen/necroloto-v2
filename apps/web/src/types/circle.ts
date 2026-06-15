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

/** A podium slot in the hub card mini-podium. */
export interface PodiumSlot {
    place: 1 | 2 | 3;
    /** Display name ("Vous" or a first name). */
    name: string;
    initials: string;
    points: number;
    /** Avatar ring tone: neon = you, mag = leader. */
    ring?: 'neon' | 'mag';
}

/** A circle as seen on the "Mes cercles" hub — richer than CircleSummary. */
export interface HubCircle {
    id: string;
    name: string;
    visibility: CircleVisibility;
    members: number;
    /** My rank label, e.g. "#1". */
    myRank: string;
    rankState: 'lead' | 'mid' | 'low';
    /** Optional streak tag, e.g. "En tête". */
    tag?: string;
    /** My score in this circle. */
    points: number;
    /** Top three, ordered by place (1, 2, 3). */
    podium: PodiumSlot[];
}
