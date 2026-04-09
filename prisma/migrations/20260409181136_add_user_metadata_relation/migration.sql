/*
  Warnings:

  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "location";

-- CreateTable
CREATE TABLE "UserMetadata" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMetadata_userId_key" ON "UserMetadata"("userId");

-- AddForeignKey
ALTER TABLE "UserMetadata" ADD CONSTRAINT "UserMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
