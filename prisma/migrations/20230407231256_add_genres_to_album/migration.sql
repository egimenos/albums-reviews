/*
  Warnings:

  - Added the required column `genres` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "genres" TEXT NOT NULL;
