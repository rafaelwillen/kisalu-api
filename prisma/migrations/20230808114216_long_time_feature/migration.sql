/*
  Warnings:

  - You are about to drop the column `featuredImagesURL` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "featuredImagesURL";

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
