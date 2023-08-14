/*
  Warnings:

  - Added the required column `createdAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `CompanyGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "disabledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CompanyGroup" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "disabledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Company_isActive_companyGroupId_idx" ON "Company"("isActive", "companyGroupId");

-- CreateIndex
CREATE INDEX "Company_isActive_aliasName_idx" ON "Company"("isActive", "aliasName");
