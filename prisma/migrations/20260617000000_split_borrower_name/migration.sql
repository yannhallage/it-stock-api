-- AlterTable: add separated borrower name columns
ALTER TABLE "ScreenLoan"
  ADD COLUMN "borrowerFirstName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "borrowerLastName" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows: keep the previous single value as the last name
UPDATE "ScreenLoan" SET "borrowerLastName" = "borrowerName";

-- Drop the temporary defaults to match the Prisma schema
ALTER TABLE "ScreenLoan"
  ALTER COLUMN "borrowerFirstName" DROP DEFAULT,
  ALTER COLUMN "borrowerLastName" DROP DEFAULT;

-- Drop the old single column
ALTER TABLE "ScreenLoan" DROP COLUMN "borrowerName";
