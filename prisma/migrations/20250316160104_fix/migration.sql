-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "correct_answer_ru" DROP NOT NULL,
ALTER COLUMN "incorrect_answer_ru" SET DEFAULT ARRAY[]::TEXT[];
