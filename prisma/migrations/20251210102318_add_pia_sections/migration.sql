-- AlterTable
ALTER TABLE "pia_projects" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "documentsUploaded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "pia_sections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "sectionName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedBy" TEXT,

    CONSTRAINT "pia_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pia_section_history" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "modifiedBy" TEXT,
    "modificationQuery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pia_section_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pia_sections_projectId_idx" ON "pia_sections"("projectId");

-- CreateIndex
CREATE INDEX "pia_sections_sectionType_idx" ON "pia_sections"("sectionType");

-- CreateIndex
CREATE INDEX "pia_section_history_sectionId_idx" ON "pia_section_history"("sectionId");

-- AddForeignKey
ALTER TABLE "pia_sections" ADD CONSTRAINT "pia_sections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "pia_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pia_section_history" ADD CONSTRAINT "pia_section_history_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "pia_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
