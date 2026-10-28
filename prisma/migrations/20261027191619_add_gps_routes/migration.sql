-- CreateTable
CREATE TABLE "GpsRoute" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "sourcePointCount" INTEGER NOT NULL,
    "acceptedPointCount" INTEGER NOT NULL,
    "routeDistanceMeters" INTEGER NOT NULL,
    "points" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GpsRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GpsRoute_activityId_key" ON "GpsRoute"("activityId");

-- AddForeignKey
ALTER TABLE "GpsRoute" ADD CONSTRAINT "GpsRoute_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
