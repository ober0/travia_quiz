/*
  Warnings:

  - Added the required column `question` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "text_ru" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "question_ru" TEXT;

-- AlterTable
ALTER TABLE "QuizCategory" ADD COLUMN     "category_name_ru" TEXT;
