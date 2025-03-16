import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class QuestionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(questionData: { category_uuid: string; question: string; question_ru?: string; correct_answer_uuid: string; difficulty: string; type: string }) {
        return this.prisma.question.create({
            data: questionData
        })
    }

    async createQuestionAnswer(questionUuid: string, answerUuids: string[]) {
        const questionAnswers = answerUuids.map((answerUuid) => ({
            question_uuid: questionUuid,
            answer_uuid: answerUuid
        }))

        return this.prisma.questionAnswer.createMany({
            data: questionAnswers,
            skipDuplicates: true
        })
    }

    async deleteAll() {
        return this.prisma.question.deleteMany({})
    }

    async findAll() {
        return this.prisma.question.findMany({})
    }

    async update(uuid: string, data: { question_ru: string }) {
        return this.prisma.question.update({
            where: {
                uuid
            },
            data
        })
    }
}
