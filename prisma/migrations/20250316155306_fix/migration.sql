/*
  Warnings:

  - You are about to drop the column `correct_answer_uuid` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionAnswer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correct_answer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct_answer_ru` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_correct_answer_uuid_fkey";

-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_answer_uuid_fkey";

-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_question_uuid_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correct_answer_uuid",
ADD COLUMN     "correct_answer" TEXT NOT NULL,
ADD COLUMN     "correct_answer_ru" TEXT NOT NULL,
ADD COLUMN     "uncorrect_answer" TEXT[],
ADD COLUMN     "uncorrect_answer_ru" TEXT[];

-- DropTable
DROP TABLE "Answer";

-- DropTable
DROP TABLE "QuestionAnswer";
