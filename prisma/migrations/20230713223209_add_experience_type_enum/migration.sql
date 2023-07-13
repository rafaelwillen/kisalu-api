/*
  Warnings:

  - You are about to drop the `ProviderExpirienceInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ExperienceType" AS ENUM ('Work', 'Education');

-- DropForeignKey
ALTER TABLE "ProviderExpirienceInfo" DROP CONSTRAINT "ProviderExpirienceInfo_providerUserId_fkey";

-- DropTable
DROP TABLE "ProviderExpirienceInfo";

-- CreateTable
CREATE TABLE "ProviderExperienceInfo" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "type" "ExperienceType" NOT NULL,
    "providerUserId" TEXT,

    CONSTRAINT "ProviderExperienceInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProviderExperienceInfo" ADD CONSTRAINT "ProviderExperienceInfo_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
