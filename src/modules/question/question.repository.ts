import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { QuestionBaseDto, QuestionSearchDto } from './dto/search.dto'

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
        return this.prisma.question.findMany({
            where: {
                category_uuid: dto.category_uuid,
                difficulty: dto.complexity,
                type: dto.type
            }
        })
    }

    async count(dto: QuestionBaseDto) {
        return this.prisma.question.count({
            where: {
                category_uuid: dto.category_uuid,
                difficulty: dto.complexity,
                type: dto.type
            }
        })
    }

    async findByUuid(questionUuid: string) {
        return this.prisma.question.findUnique({
            where: {
                uuid: questionUuid
            }
        })
    }
}
