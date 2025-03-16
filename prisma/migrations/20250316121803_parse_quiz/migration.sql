-- CreateTable
CREATE TABLE "QuizCategory" (
    "uuid" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "QuizCategory_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "QuizQuestionCount" (
    "uuid" TEXT NOT NULL,
    "category_uuid" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestionCount_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Question" (
    "uuid" TEXT NOT NULL,
    "category_uuid" TEXT NOT NULL,
    "correct_answer_uuid" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Answer" (
    "uuid" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "question_uuid" TEXT NOT NULL,
    "answer_uuid" TEXT NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("question_uuid","answer_uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizCategory_category_id_key" ON "QuizCategory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestionCount_category_uuid_key" ON "QuizQuestionCount"("category_uuid");

-- AddForeignKey
ALTER TABLE "QuizQuestionCount" ADD CONSTRAINT "QuizQuestionCount_category_uuid_fkey" FOREIGN KEY ("category_uuid") REFERENCES "QuizCategory"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_category_uuid_fkey" FOREIGN KEY ("category_uuid") REFERENCES "QuizCategory"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_correct_answer_uuid_fkey" FOREIGN KEY ("correct_answer_uuid") REFERENCES "Answer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_question_uuid_fkey" FOREIGN KEY ("question_uuid") REFERENCES "Question"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_answer_uuid_fkey" FOREIGN KEY ("answer_uuid") REFERENCES "Answer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
