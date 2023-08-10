/*
  Warnings:

  - You are about to drop the column `coordinatesId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the `Coordinates` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_coordinatesId_fkey";

-- DropIndex
DROP INDEX "Address_coordinatesId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "coordinatesId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "Coordinates";

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
