import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side wrapper around Supabase Storage. Uses a Supabase secret key
 * (sb_secret_... — successor of the legacy service_role key) so uploads bypass
 * RLS. The key is never exposed to clients.
 *
 * Config (env):
 *   SUPABASE_URL            https://<ref>.supabase.co
 *   SUPABASE_SECRET_KEY     server-only secret key
 *   SUPABASE_BUCKET         bucket name (default "images")
 */
@Injectable()
export class StorageService {
    private readonly logger = new Logger('Storage');
    private readonly client: SupabaseClient | null;
    private readonly bucket: string;

    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SECRET_KEY;
        this.bucket = process.env.SUPABASE_BUCKET ?? 'images';
        this.client =
            url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
        if (!this.client) {
            this.logger.warn(
                'SUPABASE_URL / SUPABASE_SECRET_KEY not set — image uploads are disabled.',
            );
        }
    }

    get enabled(): boolean {
        return this.client !== null;
    }

    /**
     * Uploads (or replaces) an image at the given path and returns its public URL.
     * A cache-busting query param is appended so clients refetch after a replace.
     */
    async uploadImage(path: string, file: { buffer: Buffer; mimetype: string }): Promise<string> {
        if (!this.client) {
            throw new InternalServerErrorException('Storage is not configured');
        }

        const { error } = await this.client.storage.from(this.bucket).upload(path, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: true,
        });

        if (error) {
            this.logger.error(`Upload failed for ${path}: ${error.message}`);
            throw new InternalServerErrorException('Image upload failed');
        }

        const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
        return `${data.publicUrl}?v=${Date.now()}`;
    }

    uploadCelebrityPhoto(
        celebrityId: string,
        file: { buffer: Buffer; mimetype: string },
    ): Promise<string> {
        return this.uploadImage(`celebrities/${celebrityId}`, file);
    }

    /** Removes an object from the bucket (no-op if storage is not configured). */
    async deleteImage(path: string): Promise<void> {
        if (!this.client) return;
        const { error } = await this.client.storage.from(this.bucket).remove([path]);
        if (error) {
            this.logger.error(`Delete failed for ${path}: ${error.message}`);
        }
    }
}
