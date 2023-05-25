/*
  Warnings:

  - A unique constraint covering the columns `[loginToken]` on the table `administrator` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "administrator" ADD COLUMN     "loginToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "administrator_loginToken_key" ON "administrator"("loginToken");
