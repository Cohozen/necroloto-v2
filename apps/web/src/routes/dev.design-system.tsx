import { createFileRoute } from '@tanstack/react-router';
import { Search, Skull, Trophy, Zap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/dev/design-system')({
    component: DesignSystem,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                {title}
            </h2>
            {children}
        </section>
    );
}

const SURFACES = [
    ['bg', 'bg-bg'],
    ['bg-2', 'bg-bg-2'],
    ['surface', 'bg-surface'],
    ['surface-2', 'bg-surface-2'],
    ['surface-3', 'bg-surface-3'],
];

function DesignSystem() {
    return (
        <div className="neon-surface min-h-full">
            <div className="mx-auto flex max-w-5xl flex-col gap-12 p-6 md:p-10">
                <header className="flex flex-col gap-1">
                    <p className="font-arcade text-sm text-neon">Necroloto</p>
                    <h1 className="font-display text-4xl font-extrabold">Design system</h1>
                    <p className="text-ink-2">Néon / arcade — tokens, primitives & états clés.</p>
                </header>

                <Section title="Palette · surfaces">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {SURFACES.map(([name, cls]) => (
                            <div
                                key={name}
                                className={`flex h-20 items-end rounded-lg border border-line p-2 ${cls}`}
                            >
                                <code className="font-mono text-[11px] text-ink-2">{name}</code>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex h-20 items-end rounded-lg bg-neon p-2">
                            <code className="font-mono text-[11px] text-neon-ink">neon</code>
                        </div>
                        <div className="flex h-20 items-end rounded-lg bg-coral p-2">
                            <code className="font-mono text-[11px] text-[#1c0a06]">coral</code>
                        </div>
                        <div className="flex h-20 items-end rounded-lg bg-magenta p-2">
                            <code className="font-mono text-[11px] text-white">magenta</code>
                        </div>
                    </div>
                </Section>

                <Section title="Typographie">
                    <div className="flex flex-col gap-2">
                        <p className="font-display text-5xl font-extrabold tabular-nums">
                            1 247 <span className="text-glow-neon">PTS</span>
                        </p>
                        <p className="font-arcade text-2xl text-glow-mag">ARCADE 2026</p>
                        <p className="text-lg">Space Grotesk — texte d'interface courant.</p>
                        <p className="font-mono text-sm text-ink-2">font-mono · NCRLT-7F2A</p>
                    </div>
                </Section>

                <Section title="Boutons">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>
                            <Zap /> Primaire
                        </Button>
                        <Button variant="outline">Outline néon</Button>
                        <Button variant="secondary">Secondaire</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">
                            <Skull /> Destructif
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button>Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="icon" aria-label="action">
                            <Search />
                        </Button>
                    </div>
                </Section>

                <Section title="Badges & statuts">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="alive">
                            <span className="size-2 animate-pulse-dot rounded-full bg-neon" />{' '}
                            Vivant·e
                        </Badge>
                        <Badge variant="dead">
                            <span className="size-2 rounded-full bg-coral" /> Décédé·e
                        </Badge>
                        <Badge variant="score" className="font-display text-base">
                            +120
                        </Badge>
                        <Badge variant="streak">
                            <Zap className="size-3" /> Série 4
                        </Badge>
                        <Badge variant="secondary">2026</Badge>
                    </div>
                </Section>

                <Section title="Avatars">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-12 ring-2 ring-neon/60 ring-offset-2 ring-offset-bg">
                            <AvatarFallback className="bg-gradient-to-br from-[#2bd4ff] to-neon font-display font-extrabold text-[#07140b]">
                                CL
                            </AvatarFallback>
                        </Avatar>
                        <Avatar className="size-12">
                            <AvatarFallback className="bg-surface-3 text-ink-2">JD</AvatarFallback>
                        </Avatar>
                    </div>
                </Section>

                <Section title="Contrôles">
                    <Tabs defaultValue="rank">
                        <TabsList>
                            <TabsTrigger value="rank">Classement</TabsTrigger>
                            <TabsTrigger value="bets">Paris</TabsTrigger>
                            <TabsTrigger value="members">Membres</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-3">
                        <Switch defaultChecked />{' '}
                        <span className="text-sm text-ink-2">Cercle public</span>
                    </div>
                    <Input placeholder="Rechercher une célébrité…" className="max-w-sm" />
                    <InputOTP maxLength={6}>
                        <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <InputOTPSlot key={i} index={i} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </Section>

                <Section title="États clés · classement">
                    <div className="flex flex-col gap-2">
                        <LeaderRow rank={1} name="Corentin" pts={1247} state="leader" />
                        <LeaderRow rank={4} name="Jordan" pts={680} state="me" />
                        <LeaderRow rank={9} name="Sam" pts={120} state="last" />
                    </div>
                </Section>

                <Section title="États clés · célébrité">
                    <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                        <CelebCard name="Buck H." sub="78 ans" alive />
                        <CelebCard name="Gloria V." sub="† 2026" alive={false} />
                    </div>
                </Section>
            </div>
        </div>
    );
}

function LeaderRow({
    rank,
    name,
    pts,
    state,
}: {
    rank: number;
    name: string;
    pts: number;
    state: 'leader' | 'me' | 'last';
}) {
    const tone =
        state === 'leader'
            ? 'border-neon/45 bg-gradient-to-r from-neon/10 to-surface shadow-glow-soft'
            : state === 'last'
              ? 'border-coral/35 bg-gradient-to-r from-coral/7 to-surface'
              : 'border-line bg-surface outline outline-1 outline-dashed outline-neon/50';
    return (
        <div
            className={`grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-xl border p-3 ${tone}`}
        >
            <span
                className={`text-center font-display text-2xl font-extrabold tabular-nums ${state === 'leader' ? 'text-neon' : 'text-ink-3'}`}
            >
                {rank}
            </span>
            <span className="font-semibold">{name}</span>
            <span
                className={`text-right font-display text-2xl font-extrabold tabular-nums ${state === 'leader' ? 'text-neon' : 'text-ink'}`}
            >
                {pts}
            </span>
        </div>
    );
}

function CelebCard({ name, sub, alive }: { name: string; sub: string; alive: boolean }) {
    return (
        <Card className="overflow-hidden p-0">
            <CardContent className="flex flex-col gap-2 p-3">
                <div
                    className={`flex aspect-square items-end justify-center rounded-xl bg-gradient-to-br from-[#38c] to-[#163] ${alive ? '' : 'grayscale brightness-[0.62]'}`}
                >
                    <Trophy className="mb-3 size-10 text-white/80" />
                </div>
                <p className="font-bold leading-tight">{name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-3">{sub}</span>
                    {alive ? (
                        <Badge variant="alive" className="h-6 px-2 text-[10px]">
                            Vivant·e
                        </Badge>
                    ) : (
                        <Badge variant="dead" className="h-6 px-2 text-[10px]">
                            Décédé·e
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
