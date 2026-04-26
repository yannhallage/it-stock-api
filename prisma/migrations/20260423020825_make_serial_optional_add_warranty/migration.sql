-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "serial_number" TEXT,
ADD COLUMN     "warrantyEndDate" TIMESTAMP(3),
ADD COLUMN     "warrantyStartDate" TIMESTAMP(3);
