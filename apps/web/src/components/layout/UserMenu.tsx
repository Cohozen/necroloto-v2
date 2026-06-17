import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initialsOf, userDisplayName } from '@/lib/api/adapters';
import { useCurrentUser } from '@/lib/api/currentUser';
import { isClerkConfigured } from '@/lib/auth/clerk';

/** Avatar of the signed-in user + dropdown (profile, admin, sign out). */
export function UserMenu() {
    const navigate = useNavigate();
    const { user, isAdmin } = useCurrentUser();
    const { signOut } = useClerk();

    const name = user ? userDisplayName(user) : 'Joueur';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="rounded-full outline-none ring-offset-bg focus-visible:ring-2 focus-visible:ring-neon/60"
                aria-label="Menu du compte"
            >
                <Avatar className="size-[38px] ring-2 ring-neon/60 ring-offset-2 ring-offset-bg md:size-[42px]">
                    {user?.image && <AvatarImage src={user.image} alt={name} />}
                    <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                        {initialsOf(name)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: '/profile' })}>
                    <User size={16} /> Mon profil
                </DropdownMenuItem>
                {isAdmin && (
                    <DropdownMenuItem onSelect={() => navigate({ to: '/admin/celebrities' })}>
                        <ShieldCheck size={16} /> Administration
                    </DropdownMenuItem>
                )}
                {isClerkConfigured && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
                            <LogOut size={16} /> Déconnexion
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
