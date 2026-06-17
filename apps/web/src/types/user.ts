export interface AvatarPerson {
    id: string;
    initials: string;
    /** Ring tone: neon = you, mag = leader. */
    ring?: 'neon' | 'mag';
}
