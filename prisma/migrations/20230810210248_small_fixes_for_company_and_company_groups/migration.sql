/*
  Warnings:

  - A unique constraint covering the columns `[cnpj,companyGroupId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserToCompany" ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "expiredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserToCompanyGroup" ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "expiredAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_companyGroupId_key" ON "Company"("cnpj", "companyGroupId");
