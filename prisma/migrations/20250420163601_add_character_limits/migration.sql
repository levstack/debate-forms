/*
  Warnings:

  - You are about to alter the column `name` on the `Team` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to alter the column `name` on the `TeamMember` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "mejorConcluId" TEXT,
ADD COLUMN     "mejorIntroductorId" TEXT,
ADD COLUMN     "mejorR1Id" TEXT,
ADD COLUMN     "mejorR2Id" TEXT;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "name" SET DATA TYPE VARCHAR(12);

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "name" SET DATA TYPE VARCHAR(16);

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_mejorIntroductorId_fkey" FOREIGN KEY ("mejorIntroductorId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_mejorR1Id_fkey" FOREIGN KEY ("mejorR1Id") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_mejorR2Id_fkey" FOREIGN KEY ("mejorR2Id") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_mejorConcluId_fkey" FOREIGN KEY ("mejorConcluId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
