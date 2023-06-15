-- CreateTable
CREATE TABLE "emailValidationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ActivatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "emailValidationToken_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE UNIQUE INDEX "emailValidationToken_token_key" ON "emailValidationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "emailValidationToken_identifier_token_key" ON "emailValidationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "emailValidationToken" ADD CONSTRAINT "emailValidationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
