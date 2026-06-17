import { Logo } from '@/components/layout/Logo';

// In-page anchors (resolved) vs. legal pages not built yet (placeholder buttons).
const ANCHORS = [
    { href: '#how', label: 'Comment ça marche' },
    { href: '#preview', label: 'Le jeu' },
    { href: '#join', label: 'Cercles' },
];
const SOON = ['Mentions légales', 'Jeu responsable'];

const linkClass = 'text-[13.5px] text-ink-2 transition-colors hover:text-neon';

/** Landing footer — brand, secondary links, legal note. */
export function LandingFooter() {
    return (
        <footer className="mt-6 border-t border-line px-5 pb-10 pt-7">
            <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 md:flex-row md:items-center">
                <a href="#top" aria-label="Necroloto — haut de page">
                    <Logo cell={3} withWord />
                </a>
                <nav className="flex flex-wrap items-center gap-[18px]">
                    {ANCHORS.map((link) => (
                        <a key={link.label} href={link.href} className={linkClass}>
                            {link.label}
                        </a>
                    ))}
                    {SOON.map((label) => (
                        <button key={label} type="button" className={linkClass}>
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="text-[12.5px] text-ink-3 md:ml-auto">
                    © 2026 Necroloto · Un jeu entre amis, sans argent réel.
                </div>
            </div>
        </footer>
    );
}
