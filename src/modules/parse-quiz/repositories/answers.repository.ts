import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnswerRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createMany(answers: { text: string; text_ru?: string }[]) {
        return this.prisma.answer.createMany({
            data: answers,
            skipDuplicates: true
        })
    }

    async findByUuid(uuid: string) {
        return this.prisma.answer.findUnique({
            where: { uuid }
        })
    }

    async getByTexts(texts: string[]) {
        return this.prisma.answer.findMany({
            where: { text: { in: texts } }
        })
    }

    async getAll() {
        return this.prisma.answer.findMany()
    }

    async deleteAll() {
        return this.prisma.answer.deleteMany({})
    }
}
