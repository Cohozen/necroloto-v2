// Verifies Supabase Storage upload via StorageService against the real bucket.
// Uploads a tiny PNG to a throwaway path, checks the public URL is reachable,
// then deletes it. Requires SUPABASE_URL + SUPABASE_SECRET_KEY in .env.
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const {
  StorageService,
} = require('../dist/src/modules/storage/storage.service.js');

// Minimal valid 1x1 transparent PNG.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: false,
});
const storage = app.get(StorageService);

let failures = 0;
const ok = (cond, label) => {
  console.log(`  ${cond ? '✅' : '❌'} ${label}`);
  if (!cond) failures++;
};

try {
  ok(storage.enabled, 'StorageService is configured (URL + secret key present)');
  if (!storage.enabled) throw new Error('Storage not configured');

  const path = `test/upload-check-${Date.now()}`;
  const url = await storage.uploadImage(path, {
    buffer: PNG_1x1,
    mimetype: 'image/png',
  });
  console.log(`     uploaded -> ${url}`);
  ok(typeof url === 'string' && url.includes('/storage/v1/object/public/'), 'public URL returned');

  const res = await fetch(url);
  ok(res.status === 200, `public URL reachable (HTTP ${res.status})`);
  ok(
    (res.headers.get('content-type') ?? '').startsWith('image/'),
    `served as image (${res.headers.get('content-type')})`,
  );

  await storage.deleteImage(path);
  const after = await fetch(url.split('?')[0]);
  ok(after.status === 400 || after.status === 404, `deleted (HTTP ${after.status} after remove)`);

  console.log(failures === 0 ? '\n✅ Storage OK' : `\n❌ ${failures} failed`);
  process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
  console.error('Storage verify error:', err.message);
  process.exitCode = 1;
} finally {
  await app.close();
}
