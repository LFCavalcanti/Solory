/*
  Warnings:

  - You are about to drop the column `aliquot` on the `CompanyCnaeIss` table. All the data in the column will be lost.
  - You are about to drop the column `anexoSimples` on the `CompanyCnaeIss` table. All the data in the column will be lost.
  - You are about to drop the column `rFactor` on the `CompanyCnaeIss` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyCnaeIss" DROP COLUMN "aliquot",
DROP COLUMN "anexoSimples",
DROP COLUMN "rFactor";

-- CreateTable
CREATE TABLE "simplesNacConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "cnaeCode" VARCHAR(7) NOT NULL,
    "anexoSimples" TEXT NOT NULL,
    "isEligibleRFactor" BOOLEAN NOT NULL,
    "rFactor" DOUBLE PRECISION NOT NULL,
    "aliquotStandard" DOUBLE PRECISION NOT NULL,
    "aliquotRFactor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "simplesNacConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "simplesNacConfig" ADD CONSTRAINT "simplesNacConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
