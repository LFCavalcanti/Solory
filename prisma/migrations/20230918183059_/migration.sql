/*
  Warnings:

  - You are about to drop the column `active` on the `UserToCompany` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `UserToCompanyGroup` table. All the data in the column will be lost.
  - Added the required column `isMainAddress` to the `CompanyAddress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Company_isActive_companyGroupId_idx";

-- AlterTable
ALTER TABLE "CompanyAddress" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isMainAddress" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "CompanyCnaeIss" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserToCompany" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserToCompanyGroup" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Company_isActive_companyGroupId_cnpj_idx" ON "Company"("isActive", "companyGroupId", "cnpj");

-- CreateIndex
CREATE INDEX "Company_isActive_cnpj_idx" ON "Company"("isActive", "cnpj");

-- CreateIndex
CREATE INDEX "CompanyAddress_isActive_companyId_isMainAddress_idx" ON "CompanyAddress"("isActive", "companyId", "isMainAddress");

-- CreateIndex
CREATE INDEX "CompanyCnaeIss_isActive_companyId_cnaeCode_idx" ON "CompanyCnaeIss"("isActive", "companyId", "cnaeCode");
