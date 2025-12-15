-- AlterTable
ALTER TABLE "Product" ADD COLUMN "city" TEXT;
ALTER TABLE "Product" ADD COLUMN "district" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "city" TEXT,
    "district" TEXT,
    "wage" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "workType" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "JobPosting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_JobPosting" ("active", "createdAt", "currency", "description", "id", "images", "location", "title", "updatedAt", "userId", "wage", "workType") SELECT "active", "createdAt", "currency", "description", "id", "images", "location", "title", "updatedAt", "userId", "wage", "workType" FROM "JobPosting";
DROP TABLE "JobPosting";
ALTER TABLE "new_JobPosting" RENAME TO "JobPosting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
