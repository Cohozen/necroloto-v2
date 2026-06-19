import type { SyncJobStatus, SyncJobType } from '@/lib/api/types';

/** Human-readable French label for each job status. */
export const SYNC_JOB_STATUS_LABEL: Record<SyncJobStatus, string> = {
    PENDING: 'En attente',
    RUNNING: 'En cours',
    SUCCEEDED: 'Terminé',
    FAILED: 'Échec',
};

/** Human-readable French label for each job type. */
export const SYNC_JOB_TYPE_LABEL: Record<SyncJobType, string> = {
    WIKIDATA_BULK_ENRICH: 'Synchro Wikidata',
    DEATH_SCAN: 'Détection des décès',
};

export type SyncJobTone = 'pending' | 'running' | 'success' | 'error';

/** Maps a status to a UI tone (badge colour). */
export const SYNC_JOB_STATUS_TONE: Record<SyncJobStatus, SyncJobTone> = {
    PENDING: 'pending',
    RUNNING: 'running',
    SUCCEEDED: 'success',
    FAILED: 'error',
};

/** A job is finished once it reached a terminal status (stop polling). */
export function isTerminalJob(status: SyncJobStatus): boolean {
    return status === 'SUCCEEDED' || status === 'FAILED';
}
