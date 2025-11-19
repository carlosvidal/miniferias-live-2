-- CreateEnum
CREATE TYPE "StreamProvider" AS ENUM ('AGORA', 'HUNDREDMS');

-- AlterTable Event: Add streaming and budget fields
ALTER TABLE "Event" ADD COLUMN "streamProvider" "StreamProvider" NOT NULL DEFAULT 'AGORA';
ALTER TABLE "Event" ADD COLUMN "budget" DECIMAL(10,2);
ALTER TABLE "Event" ADD COLUMN "currency" TEXT DEFAULT 'USD';
ALTER TABLE "Event" ADD COLUMN "maxConcurrentViewers" INTEGER;
ALTER TABLE "Event" ADD COLUMN "estimatedPeakViewers" INTEGER;
ALTER TABLE "Event" ADD COLUMN "maxBooths" INTEGER;
ALTER TABLE "Event" ADD COLUMN "estimatedCost" DECIMAL(10,2);

-- AlterTable Booth: Rename agoraChannel to streamChannel and add new fields
ALTER TABLE "Booth" RENAME COLUMN "agoraChannel" TO "streamChannel";
ALTER TABLE "Booth" ADD COLUMN "streamConfig" JSONB;
ALTER TABLE "Booth" ADD COLUMN "maxConcurrentViewers" INTEGER;
ALTER TABLE "Booth" ADD COLUMN "currentViewers" INTEGER DEFAULT 0;
