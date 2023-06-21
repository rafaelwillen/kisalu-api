-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_loginId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_loginId_fkey" FOREIGN KEY ("loginId") REFERENCES "Login"("id") ON DELETE CASCADE ON UPDATE CASCADE;
