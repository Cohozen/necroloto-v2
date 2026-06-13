import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: HomePlaceholder,
});

function HomePlaceholder() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5f6e]">
                Phase 1 · scaffold
            </p>
            <h1 className="text-4xl font-bold text-[#39ff6a]">Necroloto</h1>
            <p className="text-[#9b9cac]">
                Le front web démarre. Thème néon/arcade et écrans à venir.
            </p>
        </main>
    );
}
