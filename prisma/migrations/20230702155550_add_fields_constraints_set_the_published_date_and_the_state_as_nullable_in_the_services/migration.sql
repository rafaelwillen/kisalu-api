-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "publishedDate" DROP NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'Draft';
