import { useClerk } from '@clerk/clerk-react';
import { LogOut } from 'lucide-react';
import { SettingsRow } from './SettingsRow';

/**
 * Sign-out row. Uses Clerk's `signOut`, so it must only be mounted when Clerk
 * is configured (the `_app` SignedOut gate then redirects to sign-in).
 */
export function LogoutRow() {
    const { signOut } = useClerk();
    return <SettingsRow icon={LogOut} title="Déconnexion" danger onClick={() => signOut()} />;
}
