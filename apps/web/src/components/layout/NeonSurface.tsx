import { cn } from '@/lib/utils';

interface NeonSurfaceProps {
    children: React.ReactNode;
    className?: string;
}

/** Arcade screen shell: adds the film grain + CRT scanline overlays. */
export function NeonSurface({ children, className }: NeonSurfaceProps) {
    return <div className={cn('neon-surface', className)}>{children}</div>;
}
