-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CELEBRITY_DEATH', 'CIRCLE_NEW_MEMBER', 'SEASON_BETS_OPEN', 'SEASON_OPENED', 'SEASON_CLOSED');

-- CreateEnum
CREATE TYPE "SeasonMilestone" AS ENUM ('BETS_OPEN', 'SEASON_OPENED', 'CLOSED');

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "notifiedMilestone" "SeasonMilestone";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
