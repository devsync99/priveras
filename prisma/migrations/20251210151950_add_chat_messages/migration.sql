-- AlterTable
ALTER TABLE "pia_projects" ADD COLUMN     "uploadedFiles" JSONB;

-- CreateTable
CREATE TABLE "pia_chat_messages" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "actions" JSONB,
    "status" TEXT,
    "isActionResponse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pia_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pia_chat_messages_projectId_idx" ON "pia_chat_messages"("projectId");
