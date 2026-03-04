-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "user" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_assetId_idx" ON "Assignment"("assetId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
