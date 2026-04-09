/*
  Warnings:

  - You are about to drop the column `userAgent` on the `UserMetadata` table. All the data in the column will be lost.
  - Added the required column `location` to the `UserMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserMetadata" DROP COLUMN "userAgent",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "userDemo" JSONB;
