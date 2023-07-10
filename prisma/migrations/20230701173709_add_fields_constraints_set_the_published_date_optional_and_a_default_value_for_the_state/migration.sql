-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "publishedDate" DROP NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'Draft';
