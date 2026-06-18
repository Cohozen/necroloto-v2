import { Link } from '@tanstack/react-router';
import { Zap } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';

const NAV = [
    { href: '#how', label: 'Comment ça marche' },
    { href: '#preview', label: 'Le jeu' },
    { href: '#join', label: 'Cercles' },
];

/** Sticky landing header — brand, anchor nav (desktop), auth CTAs. */
export function LandingHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-gradient-to-b from-bg/90 to-bg/55 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-3.5 px-5">
                <a href="#top" aria-label="Necroloto — haut de page">
                    <Logo cell={3} withWord />
                </a>
                <nav className="ml-6 hidden gap-7 lg:flex">
                    {NAV.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-ink-2 transition-colors hover:text-ink"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-2.5">
                    <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                        <Link to="/sign-in">Connexion</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link to="/sign-up">
                            <Zap size={15} /> S'inscrire
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
