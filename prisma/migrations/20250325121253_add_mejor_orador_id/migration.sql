/*
  Warnings:

  - You are about to drop the `BestOf` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BestOf" DROP CONSTRAINT "BestOf_resultId_fkey";

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "mejorOradorId" TEXT;

-- DropTable
DROP TABLE "BestOf";

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_mejorOradorId_fkey" FOREIGN KEY ("mejorOradorId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
