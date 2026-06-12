# Necroloto API — built from the monorepo root so the @necroloto/shared
# workspace package is available. Deploy target: Railway (DOCKERFILE builder).
FROM node:22-bookworm-slim AS base
# openssl + ca-certificates are required by Prisma's engines.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

# --- Install dependencies (cached on manifest changes) ---
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# --- Build (shared -> api, includes `prisma generate`) ---
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm build

# Railway injects PORT at runtime; the app reads process.env.PORT.
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
