/*
  Warnings:

  - You are about to drop the column `equipoAFId` on the `Debate` table. All the data in the column will be lost.
  - You are about to drop the column `equipoECId` on the `Debate` table. All the data in the column will be lost.
  - You are about to drop the column `criterion` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `debateId` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `scoreAF` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `scoreEC` on the `Evaluation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ronda,aula]` on the table `Debate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamAFId` to the `Debate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamECId` to the `Debate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criteria` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Evaluation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FONDO', 'FORMA', 'OTROS');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('AF', 'EC');

-- DropForeignKey
ALTER TABLE "Debate" DROP CONSTRAINT "Debate_equipoAFId_fkey";

-- DropForeignKey
ALTER TABLE "Debate" DROP CONSTRAINT "Debate_equipoECId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_debateId_fkey";

-- AlterTable
ALTER TABLE "Debate" DROP COLUMN "equipoAFId",
DROP COLUMN "equipoECId",
ADD COLUMN     "teamAFId" TEXT NOT NULL,
ADD COLUMN     "teamECId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "criterion",
DROP COLUMN "debateId",
DROP COLUMN "scoreAF",
DROP COLUMN "scoreEC",
ADD COLUMN     "criteria" TEXT NOT NULL,
ADD COLUMN     "resultId" TEXT NOT NULL,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "team" "TeamType" NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;

-- DropEnum
DROP TYPE "CategoryType";

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "debateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Debate_ronda_aula_key" ON "Debate"("ronda", "aula");

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_teamAFId_fkey" FOREIGN KEY ("teamAFId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_teamECId_fkey" FOREIGN KEY ("teamECId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_debateId_fkey" FOREIGN KEY ("debateId") REFERENCES "Debate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
