import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Question } from '@prisma/client'

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

    async update(uuid: string, data: { question_ru?: string; correct_answer_ru?: string; incorrect_answer_ru?: string[] }) {
        return this.prisma.question.update({
            where: {
                uuid
            },
            data
        })
    }
}
