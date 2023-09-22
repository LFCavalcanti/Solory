/*
  Warnings:

  - You are about to drop the `Cnae` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `aliquot` to the `CompanyCnaeIss` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anexoSimples` to the `CompanyCnaeIss` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rFactor` to the `CompanyCnaeIss` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompanyCnaeIss" DROP CONSTRAINT "CompanyCnaeIss_cnaeCode_fkey";

-- AlterTable
ALTER TABLE "CompanyCnaeIss" ADD COLUMN     "aliquot" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "anexoSimples" TEXT NOT NULL,
ADD COLUMN     "rFactor" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "Cnae";

-- CreateIndex
CREATE INDEX "cities_state_code_idx" ON "cities"("state", "code");
