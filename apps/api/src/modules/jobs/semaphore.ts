/**
 * A tiny counting semaphore bounding how many tasks run concurrently. Used as a
 * global cap on parallel Wikidata calls (shared across every sync job) so we
 * stay polite to the public API regardless of how many jobs are in flight.
 *
 * Hand-rolled on purpose: `p-limit` v6 is ESM-only and breaks the CJS Nest build.
 */
export class Semaphore {
    private active = 0;
    private readonly waiters: (() => void)[] = [];

    constructor(private readonly max: number) {}

    /** Runs `task` once a slot is free, releasing the slot when it settles. */
    async run<T>(task: () => Promise<T>): Promise<T> {
        await this.acquire();
        try {
            return await task();
        } finally {
            this.release();
        }
    }

    private acquire(): Promise<void> {
        if (this.active < this.max) {
            this.active++;
            return Promise.resolve();
        }
        return new Promise((resolve) => this.waiters.push(resolve));
    }

    private release(): void {
        this.active--;
        const next = this.waiters.shift();
        if (next) {
            this.active++;
            next();
        }
    }
}
