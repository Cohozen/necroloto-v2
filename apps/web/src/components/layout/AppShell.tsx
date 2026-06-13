import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { BottomTabBar } from './BottomTabBar';
import { NeonSurface } from './NeonSurface';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/** Authenticated app chrome: side rail (desktop) + top bar + bottom tabs (mobile). */
export function AppShell() {
    const [year, setYear] = useState(() => new Date().getFullYear());

    return (
        <NeonSurface className="flex h-dvh overflow-hidden">
            <SideNav />
            <div className="relative flex min-w-0 flex-1 flex-col">
                <TopBar year={year} onYearChange={setYear} />
                <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
                    <Outlet />
                </main>
                <BottomTabBar />
            </div>
        </NeonSurface>
    );
}
