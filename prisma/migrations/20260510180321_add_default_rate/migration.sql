-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "defaultRate" DOUBLE PRECISION,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Event_tenantId_idx" ON "Event"("tenantId");

-- CreateIndex
CREATE INDEX "Event_tagId_idx" ON "Event"("tagId");

-- CreateIndex
CREATE INDEX "Tag_tenantId_idx" ON "Tag"("tenantId");
