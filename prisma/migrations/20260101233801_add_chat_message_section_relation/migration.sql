-- AlterTable
ALTER TABLE "pia_chat_messages" ADD COLUMN     "sectionId" TEXT;

-- CreateIndex
CREATE INDEX "pia_chat_messages_sectionId_idx" ON "pia_chat_messages"("sectionId");

-- AddForeignKey
ALTER TABLE "pia_chat_messages" ADD CONSTRAINT "pia_chat_messages_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "pia_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
