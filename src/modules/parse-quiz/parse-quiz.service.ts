import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { CategoriesRepository } from './categories.repository'
import { TranslatorService } from '../translator/translator.service'

@Injectable()
export class ParseQuizService {
    private readonly logger = new Logger(ParseQuizService.name)

    private readonly baseUrl: string = 'https://opentdb.com/'

    constructor(
        private readonly prisma: PrismaService,
        private readonly categoriesRepository: CategoriesRepository,
        private readonly translatorService: TranslatorService
    ) {}

    @Cron('0 0 * * *') // Каждый день в 00:00
    async handleCron() {
        this.logger.log('Запускаю парсинг вопросов...')
        await this.parseQuizData()
    }

    async parseQuizData() {
        this.logger.log('Начинаю парсинг категорий')
        await this.parseCategory()
    }

    private async parseCategory() {
        try {
            const response = await fetch(`${this.baseUrl}/api_category.php`).then((r) => r.json())

            const categories = await Promise.all(
                response.trivia_categories.map(async (category) => {
                    const category_name_ru = await this.translatorService.translateText({
                        from: 'en',
                        to: 'ru',
                        text: category.name
                    })
                    return {
                        category_id: category.id,
                        category_name: category.name,
                        category_name_ru: category_name_ru.text
                    }
                })
            )

            await this.categoriesRepository.deleteAll()
            await this.categoriesRepository.createMany(categories)

            this.logger.log('Парсинг категорий заверешен успешно')
        } catch (error) {
            this.logger.error('Ошибка при парсинге категорий:', error)
        }
    }
}
