import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createMany(categories: { category_id: number; category_name: string }[]) {
        return this.prisma.quizCategory.createMany({
            data: categories,
            skipDuplicates: true
        })
    }

    async getAll() {
        return this.prisma.quizCategory.findMany()
    }

    async findById(category_id: number) {
        return this.prisma.quizCategory.findUnique({
            where: { category_id }
        })
    }

    async findAllNotTranslates() {
        return this.prisma.quizCategory.findMany({
            where: {
                category_name_ru: null
            }
        })
    }

    async update(uuid: string, data: { category_name_ru?: string }) {
        return this.prisma.quizCategory.update({
            where: {
                uuid
            },
            data
        })
    }

    async deleteAll() {
        return this.prisma.quizCategory.deleteMany()
    }

    async getCategories() {
        return this.prisma.quizCategory.findMany({
            select: {
                uuid: true,
                category_name: true,
                category_name_ru: true
            }
        })
    }
}
