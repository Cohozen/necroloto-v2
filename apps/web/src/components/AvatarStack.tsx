import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AvatarPerson } from '@/types/user';

interface AvatarStackProps {
    people: AvatarPerson[];
    size?: number;
    max?: number;
    className?: string;
}

/** Overlapping avatar row (nl-stack) — circle members, scorers, etc. */
export function AvatarStack({ people, size = 34, max = 4, className }: AvatarStackProps) {
    const shown = people.slice(0, max);
    const extra = people.length - shown.length;
    return (
        <span className={cn('flex items-center', className)}>
            {shown.map((person, i) => (
                <Avatar
                    key={person.id}
                    style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -10 }}
                    className={cn(
                        'border-2 border-surface',
                        person.ring === 'neon' && 'ring-2 ring-neon/65',
                        person.ring === 'mag' && 'ring-2 ring-magenta/70',
                    )}
                >
                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display text-xs font-extrabold text-[#07140b]">
                        {person.initials}
                    </AvatarFallback>
                </Avatar>
            ))}
            {extra > 0 && (
                <span
                    style={{ width: size, height: size, marginLeft: -10 }}
                    className="inline-flex items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-xs font-bold text-ink-2"
                >
                    +{extra}
                </span>
            )}
        </span>
    );
}
