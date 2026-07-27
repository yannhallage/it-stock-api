-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- Copy beneficiaries from User into Employee (same id to avoid remapping)
INSERT INTO "Employee" ("id", "firstName", "lastName", "email", "createdAt", "updatedAt")
SELECT DISTINCT u."id", u."firstName", u."lastName", u."email", u."createdAt", u."updatedAt"
FROM "User" u
INNER JOIN "Assignment" a ON a."userId" = u."id";

-- Drop FK Assignment -> User
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_userId_fkey";

-- Rename column userId -> employeeId
ALTER TABLE "Assignment" RENAME COLUMN "userId" TO "employeeId";

-- Rename index
ALTER INDEX "Assignment_userId_idx" RENAME TO "Assignment_employeeId_idx";

-- Add FK Assignment -> Employee
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
