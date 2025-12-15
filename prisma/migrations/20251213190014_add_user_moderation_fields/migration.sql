-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "phone" TEXT,
    "city" TEXT,
    "district" TEXT,
    "bio" TEXT,
    "certificates" TEXT,
    "crops" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedUntil" DATETIME,
    "banReason" TEXT,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "restrictionReason" TEXT
);
INSERT INTO "new_User" ("bio", "certificates", "city", "createdAt", "crops", "district", "email", "id", "image", "name", "password", "phone", "role", "updatedAt") SELECT "bio", "certificates", "city", "createdAt", "crops", "district", "email", "id", "image", "name", "password", "phone", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
