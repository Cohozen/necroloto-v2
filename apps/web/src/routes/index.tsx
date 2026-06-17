import { SignedIn } from '@clerk/clerk-react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { AmbientBackground } from '@/components/landing/AmbientBackground';
import { FinalCta } from '@/components/landing/FinalCta';
import { GamePreview } from '@/components/landing/GamePreview';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { isClerkConfigured } from '@/lib/auth/clerk';

export const Route = createFileRoute('/')({
    component: Landing,
});

/** Public marketing landing page, ported from docs/mockups/Necroloto Landing.html. */
function Landing() {
    return (
        <div className="relative min-h-dvh scroll-smooth">
            {/* Signed-in visitors don't need the marketing page — send them in. */}
            {isClerkConfigured && (
                <SignedIn>
                    <Navigate to="/dashboard" />
                </SignedIn>
            )}
            <AmbientBackground />
            <div className="relative z-[1]">
                <LandingHeader />
                <main>
                    <LandingHero />
                    <HowItWorks />
                    <GamePreview />
                    <FinalCta />
                </main>
                <LandingFooter />
            </div>
        </div>
    );
}
