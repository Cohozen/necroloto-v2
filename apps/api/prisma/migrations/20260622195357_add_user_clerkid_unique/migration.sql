-- Prerequisite: run scripts/dedupe-clerk-ids.mjs --apply first, or this index
-- creation fails on existing duplicate clerkId values.

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
