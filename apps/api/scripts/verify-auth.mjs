// Verifies the authorization guards against the real DB (read-only).
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');
const { CircleAdminGuard } = require('../dist/src/modules/auth/guards/circle-admin.guard.js');
const { AdminGuard } = require('../dist/src/modules/auth/guards/admin.guard.js');

const ctx = (req) => ({ switchToHttp: () => ({ getRequest: () => req }) });
const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
});
const prisma = app.get(PrismaService);

let failures = 0;
const expect = async (label, fn, shouldPass) => {
    let passed;
    try {
        passed = await fn();
    } catch {
        passed = false;
    }
    const ok = passed === shouldPass;
    if (!ok) failures++;
    console.log(`  ${ok ? '✅' : '❌'} ${label}`);
};

try {
    const circleGuard = new CircleAdminGuard(prisma);
    const adminGuard = new AdminGuard();

    // Find a real ADMIN membership.
    const adminM = await prisma.membership.findFirst({
        where: { role: 'ADMIN' },
        include: { user: true },
    });
    const memberM = await prisma.membership.findFirst({
        where: { role: 'MEMBER' },
        include: { user: true },
    });

    console.log('\n[CircleAdminGuard]');
    await expect(
        'circle ADMIN member is allowed',
        () =>
            circleGuard.canActivate(
                ctx({
                    user: { sub: adminM.user.clerkId },
                    params: { id: adminM.circleId },
                }),
            ),
        true,
    );
    await expect(
        'plain MEMBER is forbidden on their circle',
        () =>
            circleGuard.canActivate(
                ctx({
                    user: { sub: memberM.user.clerkId },
                    params: { id: memberM.circleId },
                }),
            ),
        false,
    );
    await expect(
        'unknown user is forbidden',
        () =>
            circleGuard.canActivate(
                ctx({
                    user: { sub: 'no-such-clerk-id' },
                    params: { id: adminM.circleId },
                }),
            ),
        false,
    );
    await expect(
        'global admin claim bypasses circle check',
        () =>
            circleGuard.canActivate(
                ctx({
                    user: { sub: 'x', public_metadata: { roles: ['admin'] } },
                    params: { id: adminM.circleId },
                }),
            ),
        true,
    );

    console.log('\n[AdminGuard]');
    await expect(
        'admin role in claims is allowed',
        () =>
            adminGuard.canActivate(
                ctx({ user: { sub: 'x', public_metadata: { roles: ['admin'] } } }),
            ),
        true,
    );
    await expect(
        'no admin role (and no secret) is forbidden',
        () => adminGuard.canActivate(ctx({ user: { sub: 'x' } })),
        false,
    );

    console.log(failures === 0 ? '\n✅ Auth guards OK' : `\n❌ ${failures} failed`);
    process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
    console.error('Auth verify error:', err);
    process.exitCode = 1;
} finally {
    await app.close();
}
