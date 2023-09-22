/*
  Warnings:

  - Added the required column `description` to the `CompanyCnaeIss` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rFactor` on the `CompanyCnaeIss` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CompanyCnaeIss" ADD COLUMN     "description" TEXT NOT NULL,
DROP COLUMN "rFactor",
ADD COLUMN     "rFactor" DOUBLE PRECISION NOT NULL;
