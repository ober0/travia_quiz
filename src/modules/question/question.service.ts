import { Injectable } from '@nestjs/common'
import { ComplexityEnum } from './enums/complexity.enum'
import { QuestionBaseDto, QuestionSearchDto } from './dto/search.dto'
import { QuestionRepository } from './question.repository'
import { QuestionTypesEnum } from './enums/question-types.enum'
import { CoinsConst } from './consts/coins.const'

@Injectable()
export class QuestionService {
    constructor(private readonly repository: QuestionRepository) {}

    async getComplexity() {
        return Object.values(ComplexityEnum)
    }

    async getTypes() {
        return Object.values(QuestionTypesEnum)
    }

    async getQuestions(dto: QuestionSearchDto) {
        const allQuestions = await this.repository.find(dto)

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

    async getQuestionsCount(dto: QuestionBaseDto) {
        return this.repository.count(dto)
    }

    async getReward() {
        return Object.entries(CoinsConst).map(([complexity, coins]) => ({
            complexity,
            coins
        }))
    }
}
