/*
  Warnings:

  - A unique constraint covering the columns `[role,teamType,teamId]` on the table `TeamRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `TeamRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamRole" ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TeamRole_role_teamType_teamId_key" ON "TeamRole"("role", "teamType", "teamId");

-- AddForeignKey
ALTER TABLE "TeamRole" ADD CONSTRAINT "TeamRole_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
