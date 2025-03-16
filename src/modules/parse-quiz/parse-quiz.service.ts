import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { CategoriesRepository } from './categories.repository'
import { TranslatorService } from '../translator/translator.service'
import { QuestionCountRepository } from './question-count.repository'

@Injectable()
export class ParseQuizService {
    private readonly logger = new Logger(ParseQuizService.name)

    private readonly baseUrl: string = 'https://opentdb.com/'

    constructor(
        private readonly prisma: PrismaService,
        private readonly categoriesRepository: CategoriesRepository,
        private readonly translatorService: TranslatorService,
        private readonly questionCountRepository: QuestionCountRepository
    ) {}

    @Cron('0 0 * * *') // Каждый день в 00:00
    async handleCron() {
        this.logger.log('Запускаю парсинг вопросов...')
        await this.parseQuizData()
    }

    async parseQuizData() {
        // Парсинг категорий
        await this.parseCategory()

        // Парсинг кол-ва вопросов в категориях
        await this.parsingNumberOfQuestions()
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    private async parseCategory() {
        this.logger.log('Начинаю парсинг категорий')
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

            this.logger.log('Парсинг категорий завершен успешно')
        } catch (error) {
            this.logger.error('Ошибка при парсинге категорий:', error)
        }
    }

    private async parsingNumberOfQuestions() {
        this.logger.log('Начинаю парсинг кол-ва вопросов в категориях')
        try {
            const categories = await this.categoriesRepository.getAll()

            const data = await Promise.all(
                categories.map(async (category) => {
                    const category_id = category.category_id

                    const response = await fetch(`${this.baseUrl}/api_count.php?category=${category_id}`).then((r) => r.json())

                    return {
                        category_uuid: category.uuid,
                        count: response.category_question_count.total_question_count
                    }
                })
            )

            await this.questionCountRepository.deleteAll()
            await this.questionCountRepository.createMany(data)

            this.logger.log('Парсинг кол-ва вопросов в категориях завершен успешно')
        } catch (error) {
            this.logger.error('Ошибка при парсинге кол-ва вопросов в категориях:', error)
        }
    }
}
