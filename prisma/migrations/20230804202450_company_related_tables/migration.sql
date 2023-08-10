-- CreateTable
CREATE TABLE "CompanyGroup" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shareSuppliers" BOOLEAN NOT NULL DEFAULT true,
    "shareClients" BOOLEAN NOT NULL DEFAULT true,
    "shareProducts" BOOLEAN NOT NULL DEFAULT true,
    "shareKpi" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompanyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToCompanyGroup" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "companyGroupId" TEXT NOT NULL,

    CONSTRAINT "UserToCompanyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "aliasName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "logo" TEXT,
    "mainCnae" VARCHAR(7) NOT NULL,
    "mainIssCode" VARCHAR(4),
    "isMei" BOOLEAN NOT NULL DEFAULT false,
    "isSimplesNac" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL,
    "companyGroupId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToCompany" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "UserToCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAddress" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "complement" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "state" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "information" TEXT NOT NULL,

    CONSTRAINT "CompanyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCnaeIss" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cnaeCode" VARCHAR(7) NOT NULL,
    "issCode" VARCHAR(4),

    CONSTRAINT "CompanyCnaeIss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cnae" (
    "code" VARCHAR(7) NOT NULL,
    "descricao" TEXT NOT NULL,
    "annex" TEXT NOT NULL,
    "rFactor" BOOLEAN NOT NULL,
    "aliquot" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Cnae_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToCompanyGroup_userId_companyGroupId_key" ON "UserToCompanyGroup"("userId", "companyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToCompany_userId_companyId_key" ON "UserToCompany"("userId", "companyId");

-- AddForeignKey
ALTER TABLE "UserToCompanyGroup" ADD CONSTRAINT "UserToCompanyGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCompanyGroup" ADD CONSTRAINT "UserToCompanyGroup_companyGroupId_fkey" FOREIGN KEY ("companyGroupId") REFERENCES "CompanyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_companyGroupId_fkey" FOREIGN KEY ("companyGroupId") REFERENCES "CompanyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCompany" ADD CONSTRAINT "UserToCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCompany" ADD CONSTRAINT "UserToCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_cityCode_fkey" FOREIGN KEY ("cityCode") REFERENCES "cities"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCnaeIss" ADD CONSTRAINT "CompanyCnaeIss_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCnaeIss" ADD CONSTRAINT "CompanyCnaeIss_cnaeCode_fkey" FOREIGN KEY ("cnaeCode") REFERENCES "Cnae"("code") ON DELETE CASCADE ON UPDATE CASCADE;
