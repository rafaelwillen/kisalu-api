/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "activityId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_activityId_key" ON "Review"("activityId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
