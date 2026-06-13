import type { LucideIcon } from 'lucide-react';
import type { FileRouteTypes } from '@/routeTree.gen';

export type AppPath = FileRouteTypes['to'];

export interface NavItem {
    label: string;
    to: AppPath;
    icon: LucideIcon;
}
