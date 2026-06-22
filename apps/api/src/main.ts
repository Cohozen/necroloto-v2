// Load apps/api/.env into process.env before anything reads it (PrismaService,
// guards, StorageService). Must stay first. In prod (Railway) the real env vars
// are already set and no .env file exists, so dotenv is a harmless no-op and
// never overrides them.
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    // Every DTO now carries class-validator decorators, so we can validate and
    // lock down inputs: whitelist strips unknown properties, forbidNonWhitelisted
    // rejects them with a 400. transform coerces payloads (e.g. @Type(() => Date)
    // on ISO-string dates). enableImplicitConversion stays OFF on purpose — we
    // rely on explicit @Type decorators to keep coercion predictable.
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    // Allow the web/mobile clients to call the API. Comma-separated origins in
    // FRONTEND_ORIGIN, or all origins when unset (dev).
    const origins = process.env.FRONTEND_ORIGIN?.split(',').map((o) => o.trim());
    app.enableCors({
        origin: origins && origins.length > 0 ? origins : true,
        credentials: true,
    });

    // Bind to all interfaces so the container is reachable (e.g. Railway).
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
