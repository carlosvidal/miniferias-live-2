-- CreateTable for UserAuthProvider
CREATE TABLE "UserAuthProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthProvider_provider_providerId_key" ON "UserAuthProvider"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthProvider_userId_provider_key" ON "UserAuthProvider"("userId", "provider");

-- CreateIndex
CREATE INDEX "UserAuthProvider_userId_idx" ON "UserAuthProvider"("userId");

-- AddForeignKey
ALTER TABLE "UserAuthProvider" ADD CONSTRAINT "UserAuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing users: Create UserAuthProvider records for all existing users based on their current provider
INSERT INTO "UserAuthProvider" ("id", "userId", "provider", "providerId", "createdAt")
SELECT
    gen_random_uuid(),
    "id",
    "provider",
    COALESCE("providerId", "id"),  -- Use providerId if exists, otherwise use userId as fallback
    "createdAt"
FROM "User"
WHERE "provider" IS NOT NULL;
