-- CreateTable
CREATE TABLE "Repair" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "workshopEntryDate" TIMESTAMP(3) NOT NULL,
    "action" TEXT,
    "cost" DECIMAL(10,2),
    "status" "RepairStatus" NOT NULL DEFAULT 'EN_COURS',
    "outcome" "AssetStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Repair_incidentId_idx" ON "Repair"("incidentId");

-- CreateIndex
CREATE INDEX "Repair_status_idx" ON "Repair"("status");

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
