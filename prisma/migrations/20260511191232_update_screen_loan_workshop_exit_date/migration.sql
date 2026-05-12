-- AlterTable
ALTER TABLE "Repair" ADD COLUMN     "workshopExitDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ScreenLoan" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL,
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreenLoan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScreenLoan_assetId_idx" ON "ScreenLoan"("assetId");

-- CreateIndex
CREATE INDEX "ScreenLoan_returnedAt_idx" ON "ScreenLoan"("returnedAt");

-- AddForeignKey
ALTER TABLE "ScreenLoan" ADD CONSTRAINT "ScreenLoan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
