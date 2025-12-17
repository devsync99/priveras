-- AlterTable
ALTER TABLE "pia_chat_messages" ADD COLUMN     "isDraftAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSectionSteps" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pia_projects" ADD COLUMN     "acceptedDrafts" JSONB;
