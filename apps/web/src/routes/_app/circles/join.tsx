import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { useCurrentUser } from '@/lib/api/currentUser';
import { useJoinCircleByCode } from '@/lib/api/queries';

export const Route = createFileRoute('/_app/circles/join')({
    component: JoinCircle,
});

const slotClass =
    'size-10 md:size-12 rounded-xl border-[1.5px] border-line-2 bg-surface font-display text-[26px] font-extrabold text-ink sm:size-[52px] sm:text-[30px] data-[active=true]:border-neon/80 data-[active=true]:text-neon data-[active=true]:ring-[3px] data-[active=true]:ring-neon/20';

function JoinCircle() {
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const joinCircle = useJoinCircleByCode();
    const [code, setCode] = useState('');

    const canSubmit = !!user && code.length === 6 && !joinCircle.isPending;

    const handleJoin = () => {
        if (!canSubmit || !user) return;
        joinCircle.mutate(
            { code, userId: user.id },
            {
                onSuccess: (circle) => {
                    navigate({ to: '/circles/$id', params: { id: circle.id } });
                },
            },
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-[500px] flex-col gap-6 p-4 md:p-6">
            <Link
                to="/circles"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
            >
                <ChevronLeft size={16} /> Mes cercles
            </Link>

            <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                    Rejoindre un cercle
                </div>
                <h1 className="mt-2 font-display text-[42px] font-extrabold leading-none">
                    Rejoignez vos potes
                </h1>
                <p className="mx-auto mt-2 max-w-[42ch] text-[14.5px] text-ink-2">
                    Un ami vous a donné un code ? Entrez-le pour rejoindre son cercle.
                </p>
            </div>

            <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-7 text-center">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

                <span className="flex size-[88px] items-center justify-center rounded-[20px] border border-neon/30 bg-neon/10 text-neon shadow-glow-soft">
                    <Ticket size={38} />
                </span>
                <div>
                    <div className="font-display text-2xl font-extrabold">Entrez le code</div>
                    <p className="mx-auto mt-2 max-w-[32ch] text-[14px] text-ink-2">
                        6 caractères fournis par l'hôte du cercle. Collez-le ou tapez-le.
                    </p>
                </div>

                <InputOTP
                    maxLength={6}
                    containerClassName="gap-2.5"
                    value={code}
                    onChange={(value) => setCode(value.toUpperCase())}
                >
                    <InputOTPGroup className="gap-2.5">
                        <InputOTPSlot index={0} className={slotClass} />
                        <InputOTPSlot index={1} className={slotClass} />
                        <InputOTPSlot index={2} className={slotClass} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-ink-3" />
                    <InputOTPGroup className="gap-2.5">
                        <InputOTPSlot index={3} className={slotClass} />
                        <InputOTPSlot index={4} className={slotClass} />
                        <InputOTPSlot index={5} className={slotClass} />
                    </InputOTPGroup>
                </InputOTP>

                {joinCircle.isError ? (
                    <p className="text-xs text-coral">
                        {joinCircle.error instanceof Error
                            ? joinCircle.error.message
                            : 'Impossible de rejoindre ce cercle.'}
                    </p>
                ) : (
                    <p className="text-xs text-ink-3">ex. NEC7F3</p>
                )}

                <Button size="lg" className="w-full" disabled={!canSubmit} onClick={handleJoin}>
                    {joinCircle.isPending ? 'Connexion…' : 'Rejoindre le cercle'}{' '}
                    <ChevronRight size={16} />
                </Button>
                <p className="text-[13px]">
                    <span className="text-ink-3">Pas de code ? </span>
                    <Link to="/circles" className="font-semibold text-neon">
                        Parcourir les cercles publics
                    </Link>
                </p>
            </div>
        </div>
    );
}
