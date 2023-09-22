/*
  Warnings:

  - You are about to alter the column `aliasName` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to drop the column `cep` on the `CompanyAddress` table. All the data in the column will be lost.
  - Added the required column `postalCode` to the `CompanyAddress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompanyAddress" DROP CONSTRAINT "CompanyAddress_cityCode_fkey";

-- DropForeignKey
ALTER TABLE "CompanyCnaeIss" DROP CONSTRAINT "CompanyCnaeIss_cnaeCode_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "aliasName" SET DATA TYPE VARCHAR(60);

-- AlterTable
ALTER TABLE "CompanyAddress" DROP COLUMN "cep",
ADD COLUMN     "postalCode" TEXT NOT NULL,
ALTER COLUMN "information" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_cityCode_fkey" FOREIGN KEY ("cityCode") REFERENCES "cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCnaeIss" ADD CONSTRAINT "CompanyCnaeIss_cnaeCode_fkey" FOREIGN KEY ("cnaeCode") REFERENCES "Cnae"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
