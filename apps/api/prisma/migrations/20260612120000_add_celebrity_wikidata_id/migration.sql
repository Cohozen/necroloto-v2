-- AlterTable
ALTER TABLE "Celebrity" ADD COLUMN     "wikidataId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Celebrity_wikidataId_key" ON "Celebrity"("wikidataId");
