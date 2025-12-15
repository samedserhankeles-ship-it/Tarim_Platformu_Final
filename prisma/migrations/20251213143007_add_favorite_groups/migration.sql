-- CreateTable
CREATE TABLE "FavoriteGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FavoriteGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "productId" TEXT,
    "jobPostingId" TEXT,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FavoriteGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Favorite_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt", "id", "jobPostingId", "productId", "userId") SELECT "createdAt", "id", "jobPostingId", "productId", "userId" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");
CREATE UNIQUE INDEX "Favorite_userId_jobPostingId_key" ON "Favorite"("userId", "jobPostingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteGroup_userId_name_key" ON "FavoriteGroup"("userId", "name");
