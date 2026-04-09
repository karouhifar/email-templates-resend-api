/*
  Warnings:

  - Added the required column `message` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "message" TEXT NOT NULL;
