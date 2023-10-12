-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "emailValidationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ActivatedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "emailValidationToken_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "CompanyGroup" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),
    "shareSuppliers" BOOLEAN NOT NULL DEFAULT true,
    "shareClients" BOOLEAN NOT NULL DEFAULT true,
    "shareProducts" BOOLEAN NOT NULL DEFAULT true,
    "shareKpi" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompanyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToCompanyGroup" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "companyGroupId" TEXT NOT NULL,

    CONSTRAINT "UserToCompanyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),
    "aliasName" VARCHAR(60) NOT NULL,
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "UserToCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAddress" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "isMainAddress" BOOLEAN NOT NULL,
    "street" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "complement" TEXT,
    "locale" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "information" TEXT,

    CONSTRAINT "CompanyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCnaeIss" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "cnaeCode" VARCHAR(7) NOT NULL,
    "description" TEXT NOT NULL,
    "issCode" VARCHAR(4),

    CONSTRAINT "CompanyCnaeIss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("code")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "emailValidationToken_token_key" ON "emailValidationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "emailValidationToken_identifier_token_key" ON "emailValidationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserToCompanyGroup_userId_companyGroupId_key" ON "UserToCompanyGroup"("userId", "companyGroupId");

-- CreateIndex
CREATE INDEX "Company_isActive_companyGroupId_cnpj_idx" ON "Company"("isActive", "companyGroupId", "cnpj");

-- CreateIndex
CREATE INDEX "Company_isActive_aliasName_idx" ON "Company"("isActive", "aliasName");

-- CreateIndex
CREATE INDEX "Company_isActive_cnpj_idx" ON "Company"("isActive", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_companyGroupId_key" ON "Company"("cnpj", "companyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToCompany_userId_companyId_key" ON "UserToCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyAddress_isActive_companyId_isMainAddress_idx" ON "CompanyAddress"("isActive", "companyId", "isMainAddress");

-- CreateIndex
CREATE INDEX "CompanyCnaeIss_isActive_companyId_cnaeCode_idx" ON "CompanyCnaeIss"("isActive", "companyId", "cnaeCode");

-- CreateIndex
CREATE INDEX "cities_state_code_idx" ON "cities"("state", "code");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emailValidationToken" ADD CONSTRAINT "emailValidationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_cityCode_fkey" FOREIGN KEY ("cityCode") REFERENCES "cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCnaeIss" ADD CONSTRAINT "CompanyCnaeIss_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simplesNacConfig" ADD CONSTRAINT "simplesNacConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
