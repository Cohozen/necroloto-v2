-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CELEBRITY_PROPOSAL_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'CELEBRITY_PROPOSAL_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'CELEBRITY_PROPOSAL_PENDING';
ALTER TYPE "NotificationType" ADD VALUE 'WELCOME';
ALTER TYPE "NotificationType" ADD VALUE 'SEASON_WINNER';
ALTER TYPE "NotificationType" ADD VALUE 'BET_CLOSING_SOON';

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "betsClosingNotifiedAt" TIMESTAMP(3);
