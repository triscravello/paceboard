-- CreateEnum
CREATE TYPE "ActivityVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "visibility" "ActivityVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "PrivacyZone" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "centerLatitude" DOUBLE PRECISION NOT NULL,
    "centerLongitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrivacyZone_ownerId_idx" ON "PrivacyZone"("ownerId");

-- CreateIndex
CREATE INDEX "Activity_visibility_recordedAt_idx" ON "Activity"("visibility", "recordedAt" DESC);

-- AddForeignKey
ALTER TABLE "PrivacyZone" ADD CONSTRAINT "PrivacyZone_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
