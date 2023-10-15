/*
  Warnings:

  - You are about to drop the column `estimatedFinishDate` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "estimatedFinishDate",
ADD COLUMN     "activityDetails" TEXT,
ALTER COLUMN "finishedDate" DROP NOT NULL;
