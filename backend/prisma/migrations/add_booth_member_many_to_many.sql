-- CreateEnum for BoothRole
CREATE TYPE "BoothRole" AS ENUM ('OWNER', 'OPERATOR', 'MODERATOR');

-- Create BoothMember table
CREATE TABLE "BoothMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boothId" TEXT NOT NULL,
    "role" "BoothRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoothMember_pkey" PRIMARY KEY ("id")
);

-- AlterTable Booth - Drop the old 1:1 relationship with User
ALTER TABLE "Booth" DROP CONSTRAINT IF EXISTS "Booth_userId_fkey";
DROP INDEX IF EXISTS "Booth_userId_idx";
ALTER TABLE "Booth" DROP COLUMN IF EXISTS "userId";

-- CreateIndex
CREATE UNIQUE INDEX "BoothMember_userId_boothId_key" ON "BoothMember"("userId", "boothId");
CREATE INDEX "BoothMember_boothId_idx" ON "BoothMember"("boothId");
CREATE INDEX "BoothMember_userId_idx" ON "BoothMember"("userId");

-- AddForeignKey
ALTER TABLE "BoothMember" ADD CONSTRAINT "BoothMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoothMember" ADD CONSTRAINT "BoothMember_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
