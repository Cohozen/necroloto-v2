-- Additive, prod-safe: existing rows backfill to status=APPROVED (the default)
-- and timestamps to now(). `updatedAt` carries a transient DEFAULT only to
-- backfill existing rows; Prisma's @updatedAt drives it from the app afterwards.

-- CreateEnum
CREATE TYPE "CelebrityStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Celebrity" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "proposedAt" TIMESTAMP(3),
ADD COLUMN     "proposedBy" TEXT,
ADD COLUMN     "status" "CelebrityStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop the transient default so future writes go through Prisma's @updatedAt.
ALTER TABLE "Celebrity" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Celebrity_status_idx" ON "Celebrity"("status");
