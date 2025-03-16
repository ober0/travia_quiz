/*
  Warnings:

  - You are about to drop the column `uncorrect_answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `uncorrect_answer_ru` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "uncorrect_answer",
DROP COLUMN "uncorrect_answer_ru",
ADD COLUMN     "incorrect_answer" TEXT[],
ADD COLUMN     "incorrect_answer_ru" TEXT[];
