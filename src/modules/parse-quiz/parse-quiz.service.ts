import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { TranslatorService } from '../translator/translator.service'
import { CategoriesRepository } from '../categories/categories.repository'
import { QuestionCountRepository } from '../question/question-count.repository'
import { QuestionRepository } from '../question/question.repository'

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

            // // Парсинг вопросов
            await this.parsingQuestion(token)

            // Перевод категорий
            await this.translateCategory()
            // Перевод вопросов
            await this.translateQuestions()

            // Перевод ответов
            await this.transalateAnswers()
        } catch (error) {
            this.logger.error('Ошибка во время парсинга:', error)
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
                    return {
                        category_id: category.id,
                        category_name: category.name
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

        await this.questionRepository.deleteAll()
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

    private async transalateData(data: any) {
        const batchSize = 250
        const result = []

        for (let i = 0; i < data.length; i += batchSize) {
            try {
                this.logger.log(`Перевод в процессе...`)
                const batch = data.slice(i, i + batchSize)
                const translatorResponse = await this.translatorService.translateText({ data: JSON.stringify(batch) })

                const parsedData = JSON.parse(translatorResponse)
                const batchResult = parsedData.entries.map((entry) => ({
                    uuid: entry.id,
                    text: entry.text
                }))

                result.push(...batchResult)
            } catch (error) {
                this.logger.error(error)
            }
        }
        this.logger.log('Перевод получен, сохранение...')
        return result
    }

    async transalateAnswers() {
        this.logger.log('Начинаю перевод ответов...')

        const answers = await this.questionRepository.findAllAnswersNotTranslates()

        const data = await Promise.all(
            answers.map(async (answer) => {
                return {
                    id: answer.uuid,
                    text: [answer.correct_answer, ...answer.incorrect_answer]
                }
            })
        )
        const translatedData = await this.transalateData(data)

        await Promise.all(
            translatedData.map(async (data) => {
                try {
                    await this.questionRepository.update(data.uuid, {
                        correct_answer_ru: data.text.at(0),
                        incorrect_answer_ru: data.text.slice(1)
                    })
                } catch (error) {
                    this.logger.error(error)
                }
            })
        )

        this.logger.log('Перевод ответов завершён')
    }

    async translateCategory() {
        this.logger.log('Начинаю перевод категорий...')

        const categories = await this.categoriesRepository.findAllNotTranslates()

        const data = await Promise.all(
            categories.map(async (category) => {
                return {
                    id: category.uuid,
                    text: [category.category_name]
                }
            })
        )

        const translatedData = await this.transalateData(data)

        await Promise.all(
            translatedData.map(async (data) => {
                try {
                    await this.categoriesRepository.update(data.uuid, {
                        category_name_ru: data.text.at(0)
                    })
                } catch (error) {
                    this.logger.error(error)
                }
            })
        )

        this.logger.log('Перевод категорий завершён')
    }

    async translateQuestions() {
        this.logger.log('Начинаю перевод вопросов...')

        const questions = await this.questionRepository.findAllNotTranslates()

        const data = await Promise.all(
            questions.map(async (question) => {
                return {
                    id: question.uuid,
                    text: [question.question]
                }
            })
        )
        const traslatedData = await this.transalateData(data)

        await Promise.all(
            traslatedData.map(async (data) => {
                try {
                    await this.questionRepository.update(data.uuid, {
                        question_ru: data.text.at(0)
                    })
                } catch (error) {
                    this.logger.error(error)
                }
            })
        )

        this.logger.log('Перевод вопросов завершён')
    }
}
