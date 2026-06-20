import { Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { GlobalSearchDialog } from '../search/GlobalSearchDialog';
import { BottomTabBar } from './BottomTabBar';
import { NeonSurface } from './NeonSurface';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/** Authenticated app chrome: side rail (desktop) + top bar + bottom tabs (mobile). */
export function AppShell() {
    const [searchOpen, setSearchOpen] = useState(false);

    // Global ⌘K (Mac) / Ctrl+K (others) shortcut to open the search palette.
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <NeonSurface className="flex h-dvh overflow-hidden">
            <SideNav />
            <div className="relative flex min-w-0 flex-1 flex-col">
                <TopBar onOpenSearch={() => setSearchOpen(true)} />
                <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
                    <Outlet />
                </main>
                <BottomTabBar />
            </div>
            <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </NeonSurface>
    );
}
