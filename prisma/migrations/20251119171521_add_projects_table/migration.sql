-- CreateTable
CREATE TABLE "pia_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pia_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pia_projects_userId_idx" ON "pia_projects"("userId");

-- AddForeignKey
ALTER TABLE "pia_projects" ADD CONSTRAINT "pia_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
