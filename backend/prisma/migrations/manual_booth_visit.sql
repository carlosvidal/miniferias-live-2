-- Manual migration script for BoothVisit table
-- Execute this directly in your PostgreSQL database if prisma migrate doesn't work

-- Check if table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BoothVisit') THEN
        -- CreateTable
        CREATE TABLE "BoothVisit" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "boothId" TEXT NOT NULL,
            "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "exitTime" TIMESTAMP(3),
            "duration" INTEGER,
            "source" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "BoothVisit_pkey" PRIMARY KEY ("id")
        );

        -- CreateIndex
        CREATE INDEX "BoothVisit_boothId_idx" ON "BoothVisit"("boothId");

        -- CreateIndex
        CREATE INDEX "BoothVisit_userId_idx" ON "BoothVisit"("userId");

        -- CreateIndex
        CREATE INDEX "BoothVisit_entryTime_idx" ON "BoothVisit"("entryTime");

        -- CreateIndex
        CREATE INDEX "BoothVisit_boothId_entryTime_idx" ON "BoothVisit"("boothId", "entryTime");

        -- AddForeignKey
        ALTER TABLE "BoothVisit" ADD CONSTRAINT "BoothVisit_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        -- AddForeignKey
        ALTER TABLE "BoothVisit" ADD CONSTRAINT "BoothVisit_boothId_fkey"
            FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'BoothVisit table created successfully';
    ELSE
        RAISE NOTICE 'BoothVisit table already exists, skipping creation';
    END IF;
END $$;
