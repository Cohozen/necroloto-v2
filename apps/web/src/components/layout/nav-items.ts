import { Home, LayoutGrid, Trophy, User } from 'lucide-react';
import type { NavItem } from '@/types/navigation';

// Primary navigation — mirrors the validated mockups (Accueil / Classement /
// Mon pari / Profil). Routes are provisional and may be refined per screen.
export const NAV_ITEMS: NavItem[] = [
    { label: 'Accueil', to: '/dashboard', icon: Home },
    { label: 'Classement', to: '/circles', icon: Trophy },
    { label: 'Mon pari', to: '/celebrities', icon: LayoutGrid },
    { label: 'Profil', to: '/profile', icon: User },
];
