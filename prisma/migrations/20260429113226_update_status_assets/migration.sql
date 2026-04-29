/*
  Warnings:

  - The values [EN_STOCK] on the enum `AssetStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetStatus_new" AS ENUM ('EN_STOCK_NON_AFFECTE', 'AFFECTE', 'EN_PANNE', 'EN_REPARATION', 'EN_SERVICE', 'HORS_SERVICE');
ALTER TABLE "Asset" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Asset" ALTER COLUMN "status" TYPE "AssetStatus_new" USING ("status"::text::"AssetStatus_new");
ALTER TABLE "Repair" ALTER COLUMN "outcome" TYPE "AssetStatus_new" USING ("outcome"::text::"AssetStatus_new");
ALTER TYPE "AssetStatus" RENAME TO "AssetStatus_old";
ALTER TYPE "AssetStatus_new" RENAME TO "AssetStatus";
DROP TYPE "AssetStatus_old";
ALTER TABLE "Asset" ALTER COLUMN "status" SET DEFAULT 'EN_STOCK_NON_AFFECTE';
COMMIT;

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "status" SET DEFAULT 'EN_STOCK_NON_AFFECTE';
