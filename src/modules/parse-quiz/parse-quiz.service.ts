import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { CategoriesRepository } from './repositories/categories.repository'
import { TranslatorService } from '../translator/translator.service'
import { QuestionCountRepository } from './repositories/question-count.repository'
import { QuestionRepository } from './repositories/question.repository'

@Injectable()
export class ParseQuizService {
    private readonly logger = new Logger(ParseQuizService.name)

    private readonly baseUrl: string = 'https://opentdb.com/'

    constructor(
        private readonly prisma: PrismaService,
        private readonly categoriesRepository: CategoriesRepository,
        private readonly translatorService: TranslatorService,
        private readonly questionCountRepository: QuestionCountRepository,
        private readonly questionRepository: QuestionRepository
    ) {}

    @Cron('0 0 1,15 * *')
    async handleCron() {
        this.logger.log('Запускаю парсинг вопросов...')
        await this.parseQuizData()
        this.logger.log('Парсинг вопросов завершен')
    }

    async parseQuizData() {
        try {
            // Парсинг категорий
            await this.parseCategory()

            // Парсинг кол-ва вопросов в категориях
            await this.parsingNumberOfQuestions()

            // Получение Token
            const token: string | null = await this.getToken()
            if (!token) {
                throw new InternalServerErrorException('Не удалось получить токен')
            }

            // Парсинг вопросов
            await this.parsingQuestion(token)

            // Перевод вопросов и ответов
            await this.translateQuestions()
        } catch (error) {
            this.logger.error('Ошибка во время парсинга:', error)

            setTimeout(() => {
                this.logger.log('Повторный запуск парсинга через 1 минуту...')
                this.parseQuizData()
            }, 60000)
        }
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

    private async getToken() {
        this.logger.log('Начинаю получение токена')
        try {
            const response = await fetch(`${this.baseUrl}/api_token.php?command=request`).then((r) => r.json())
            this.logger.log('Токен получен')

            return response?.token ?? null
        } catch (error) {
            this.logger.error('Ошибка при получении токена', error)
        }
    }

    private async parsingQuestion(token: string, amount: number = 50) {
        this.logger.log('Начинаю парсинг вопросов')

        try {
            const categories = await this.categoriesRepository.getAll()

            for (const category of categories) {
                let remainingQuestions = (await this.questionCountRepository.findById(category.uuid)).count

                while (remainingQuestions > 0) {
                    this.logger.log(`Обрабатываем категорию ${category.category_id}, осталось вопросов: ${remainingQuestions}`)

                    const response = await fetch(`${this.baseUrl}/api.php?amount=${Math.min(remainingQuestions, amount)}&category=${category.category_id}&token=${token}`).then((r) => r.json())

                    this.logger.log(`API ответил для категории ${category.category_id} с кодом ${response.response_code}`)

                    switch (response.response_code) {
                        case 0:
                            for (const data of response.results) {
                                await this.questionRepository.create({
                                    difficulty: data.difficulty,
                                    type: data.type,
                                    category_uuid: category.uuid,
                                    question: data.question,
                                    correct_answer: data.correct_answer,
                                    incorrect_answer: data.incorrect_answers
                                })
                            }

                            remainingQuestions -= response.results.length
                            break

                        case 5:
                            this.logger.warn(`Категория ${category.category_id}: слишком много запросов, жду 6 секунд...`)
                            await this.sleep(6000)
                            break

                        case 4:
                            const questionData = await this.questionCountRepository.findById(category.uuid)
                            const leftAmount = Number(questionData.count) % amount

                            if (leftAmount > 0) {
                                this.logger.log(`Категория ${category.category_id}: токен истёк, повторный запрос с leftAmount = ${leftAmount}`)
                                remainingQuestions = leftAmount
                            } else {
                                this.logger.log(`Категория ${category.category_id}: токен истёк, но leftAmount = 0, пропускаем.`)
                                remainingQuestions = 0
                            }
                            break

                        default:
                            this.logger.warn(`Категория ${category.category_id}: неизвестный код ответа ${response.response_code}`)
                            remainingQuestions = 0
                            break
                    }

                    await this.sleep(6000)
                }
            }
        } catch (error) {
            this.logger.error('Ошибка при парсинге вопросов', error)
        }
    }

    private async translateQuestions() {
        this.logger.log('Начинаю перевод вопросов...')

        const questions = await this.questionRepository.findAllNotTranslates()

        for (const question of questions) {
            try {
                const translate = await this.translatorService.translateText({
                    from: 'en',
                    to: 'ru',
                    text: question.question
                })
                if (translate?.status !== 'OK') {
                    setTimeout(() => this.translateQuestions(), 3600000)
                    return
                }
                await this.questionRepository.update(question.uuid, { question_ru: translate.text })
                this.logger.log(`Переведён вопрос ${question.uuid}`)
            } catch (error) {
                this.logger.error(`Ошибка при переводе вопроса ${question.uuid}:`, error)
                setTimeout(() => this.translateQuestions(), 3600000)
                return
            }
        }

        this.logger.log('Перевод вопросов завершён')

        await this.translateAnswers()
    }

    private async translateAnswers() {
        this.logger.log('Начинаю перевод ответов...')

        const questions = await this.questionRepository.findAll()

        for (const question of questions) {
            const correct_answer = question.correct_answer
            const incorrect_answer = question.incorrect_answer

            try {
                const correct_answer_ru = await this.translatorService.translateText({
                    from: 'en',
                    to: 'ru',
                    text: correct_answer
                })

                if (correct_answer_ru?.status !== 'OK') {
                    setTimeout(() => this.translateAnswers(), 3600000)
                    return
                }

                const incorrect_answer_ru = await Promise.all(
                    incorrect_answer.map(async (answer) => {
                        const data = await this.translatorService.translateText({
                            from: 'en',
                            to: 'ru',
                            text: answer
                        })
                        return data.text
                    })
                )

                await this.questionRepository.update(question.uuid, {
                    correct_answer_ru: correct_answer_ru.text,
                    incorrect_answer_ru
                })
            } catch (error) {
                this.logger.error(`Ошибка при переводе ответа:`, error)
                setTimeout(() => this.translateAnswers(), 3600000)
                return
            }
        }

        this.logger.log('Перевод ответов завершён')
    }
}
