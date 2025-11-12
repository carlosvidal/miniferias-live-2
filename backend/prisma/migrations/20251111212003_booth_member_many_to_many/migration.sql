/*
  Warnings:

  - You are about to drop the column `userId` on the `Booth` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BoothRole" AS ENUM ('OWNER', 'OPERATOR', 'MODERATOR');

-- DropForeignKey
ALTER TABLE "Booth" DROP CONSTRAINT "Booth_userId_fkey";

-- DropIndex
DROP INDEX "Booth_userId_idx";

-- DropIndex
DROP INDEX "Booth_userId_key";

-- AlterTable
ALTER TABLE "Booth" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "BoothMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boothId" TEXT NOT NULL,
    "role" "BoothRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoothMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoothMember_boothId_idx" ON "BoothMember"("boothId");

-- CreateIndex
CREATE INDEX "BoothMember_userId_idx" ON "BoothMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoothMember_userId_boothId_key" ON "BoothMember"("userId", "boothId");

-- AddForeignKey
ALTER TABLE "BoothMember" ADD CONSTRAINT "BoothMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoothMember" ADD CONSTRAINT "BoothMember_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
