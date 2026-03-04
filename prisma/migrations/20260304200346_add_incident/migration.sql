-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OUVERT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_assetId_idx" ON "Incident"("assetId");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
