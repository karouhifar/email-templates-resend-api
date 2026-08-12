-- CreateEnum
CREATE TYPE "EmailTemplate" AS ENUM ('NGS', 'LEGACY');

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "email_template" "EmailTemplate" NOT NULL DEFAULT 'NGS';
