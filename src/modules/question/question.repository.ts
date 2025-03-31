import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { QuestionSearchDto } from './dto/search.dto'

@Injectable()
export class QuestionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(questionData: any) {
        return this.prisma.question.create({
            data: questionData
        })
    }

    async deleteAll() {
        return this.prisma.question.deleteMany({})
    }

    async findAll() {
        return this.prisma.question.findMany({})
    }

    async findAllNotTranslates() {
        return this.prisma.question.findMany({
            where: {
                question_ru: null
            }
        })
    }

    async findAllAnswersNotTranslates() {
        return this.prisma.question.findMany({
            where: {
                correct_answer_ru: null
            }
        })
    }

    async update(uuid: string, data: { question_ru?: string; correct_answer_ru?: string; incorrect_answer_ru?: string[] }) {
        return this.prisma.question.update({
            where: {
                uuid
            },
            data
        })
    }

    async find(dto: QuestionSearchDto) {
        const allQuestions = await this.prisma.question.findMany({
            where: {
                category_uuid: dto.category_uuid,
                difficulty: dto.complexity,
                type: dto.type
            }
        })

        const randomQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, dto.limit)

        return randomQuestions.map((question) => {
            return {
                uuid: question.uuid,
                info: {
                    category_uuid: question.category_uuid,
                    difficulty: question.difficulty,
                    type: question.type
                },
                data: {
                    question: {
                        ru: question.question_ru,
                        en: question.question
                    },
                    answers: {
                        ru: [question.correct_answer_ru, ...question.incorrect_answer_ru],
                        en: [question.correct_answer, ...question.incorrect_answer]
                    }
                }
            }
        })
    }
}
