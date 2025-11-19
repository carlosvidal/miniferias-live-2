-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK', 'TIKTOK');

-- AlterTable User - Add social login fields
ALTER TABLE "User" ADD COLUMN "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN "providerId" TEXT;

-- AlterTable User - Make password optional (for social login users)
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");

-- CreateIndex
CREATE INDEX "User_provider_providerId_idx" ON "User"("provider", "providerId");
