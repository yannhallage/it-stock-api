-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('EN_STOCK', 'AFFECTE', 'EN_PANNE', 'EN_REPARATION', 'EN_SERVICE', 'HORS_SERVICE');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OUVERT', 'CLOS');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "HistoryEventType" AS ENUM ('ASSET_CREATED', 'STATUS_CHANGED', 'ASSIGNMENT_CREATED', 'ASSIGNMENT_ENDED', 'INCIDENT_REPORTED', 'REPAIR_STARTED', 'REPAIR_FINISHED');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "inventoryNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'EN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_inventoryNumber_key" ON "Asset"("inventoryNumber");
