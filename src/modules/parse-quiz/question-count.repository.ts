import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class QuestionCountRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createMany(data: { category_uuid: string; count: number }[]) {
        return this.prisma.quizQuestionCount.createMany({
            data,
            skipDuplicates: true
        })
    }

    async getAll() {
        return this.prisma.quizQuestionCount.findMany()
    }

    async findById(category_uuid: string) {
        return this.prisma.quizQuestionCount.findUnique({
            where: { category_uuid }
        })
    }

    async deleteAll() {
        return this.prisma.quizQuestionCount.deleteMany()
    }
}
