-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "emailValidationToken" ALTER COLUMN "ActivatedAt" DROP NOT NULL;
