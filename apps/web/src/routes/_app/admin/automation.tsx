import { createFileRoute } from '@tanstack/react-router';
import { RefreshCw, Skull, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { Button } from '@/components/ui/button';
import { useDetectDeaths, useRecentJobs } from '@/lib/api/queries';
import type { SyncJob } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import {
    SYNC_JOB_STATUS_LABEL,
    SYNC_JOB_STATUS_TONE,
    SYNC_JOB_TYPE_LABEL,
    type SyncJobTone,
} from '@/types/job';

export const Route = createFileRoute('/_app/admin/automation')({
    component: AdminAutomation,
});

const TONE_STYLE: Record<SyncJobTone, string> = {
    pending: 'border-line-2 bg-surface text-ink-3',
    running: 'border-[#2bd4ff]/40 bg-[#2bd4ff]/10 text-[#2bd4ff]',
    success: 'border-neon/40 bg-neon/10 text-neon',
    error: 'border-coral/40 bg-coral/10 text-coral',
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** One-line summary of a job's outcome, by type. */
function jobSummary(job: SyncJob): string {
    if (job.type === 'DEATH_SCAN') {
        return `${job.total} suivie${job.total > 1 ? 's' : ''} · ${job.succeeded} décès détecté${job.succeeded > 1 ? 's' : ''}`;
    }
    const base = `${job.processed}/${job.total} traitée${job.total > 1 ? 's' : ''}`;
    return job.failed > 0 ? `${base} · ${job.failed} échec(s)` : base;
}

function JobRow({ job }: { job: SyncJob }) {
    const tone = SYNC_JOB_STATUS_TONE[job.status];
    const Icon = job.type === 'DEATH_SCAN' ? Skull : Sparkles;
    return (
        <div className="flex items-center gap-4 rounded-xl border border-line-2 bg-surface px-4 py-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-line-2 bg-surface-2 text-ink-2">
                <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-semibold">{SYNC_JOB_TYPE_LABEL[job.type]}</span>
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                            TONE_STYLE[tone],
                        )}
                    >
                        {SYNC_JOB_STATUS_LABEL[job.status]}
                    </span>
                </div>
                <p className="mt-1 text-[12px] text-ink-3">{jobSummary(job)}</p>
                {job.error && <p className="mt-0.5 text-[12px] text-coral">{job.error}</p>}
            </div>
            <span className="shrink-0 text-[11px] text-ink-3">
                {dateFmt.format(new Date(job.createdAt))}
            </span>
        </div>
    );
}

function AdminAutomation() {
    const { data, isLoading, isError } = useRecentJobs();
    const detectDeaths = useDetectDeaths();
    const jobs = useMemo(() => data ?? [], [data]);

    const handleScan = () => {
        detectDeaths.mutate(undefined, {
            onSuccess: (res) =>
                toast.success(
                    `Scan terminé : ${res.newDeaths.length} décès détecté${res.newDeaths.length > 1 ? 's' : ''}.`,
                ),
            onError: () => toast.error('Le scan a échoué.'),
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 md:p-6">
            <AdminHeader
                section="Automatisation"
                crumb="Tâches & historique"
                actions={
                    <Button size="sm" onClick={handleScan} disabled={detectDeaths.isPending}>
                        <RefreshCw
                            size={15}
                            strokeWidth={2.4}
                            className={detectDeaths.isPending ? 'animate-spin' : undefined}
                        />
                        {detectDeaths.isPending ? 'Scan en cours…' : 'Lancer le scan'}
                    </Button>
                }
            />
            <p className="text-[13px] text-ink-3">
                La détection des décès tourne automatiquement chaque jour. Les synchronisations
                Wikidata en masse et les scans manuels apparaissent ici.
            </p>
            {isLoading ? (
                <SectionLoader label="Chargement de l'historique…" />
            ) : isError ? (
                <p className="py-12 text-center text-sm text-coral">
                    L'historique n'a pas pu être chargé.
                </p>
            ) : jobs.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-3">
                    Aucune tâche pour l'instant. Lancez un scan ou une synchro Wikidata.
                </p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {jobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
}
