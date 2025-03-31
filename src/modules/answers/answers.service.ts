import { Injectable } from '@nestjs/common'
import { QuestionRepository } from '../question/question.repository'
import { CheckAnswersDto } from './dto/answers.dto'

@Injectable()
export class AnswersService {
    constructor(private readonly repository: QuestionRepository) {}

    async checkAnswers(dto: CheckAnswersDto) {
        let res: number = 0
        await Promise.all(
            dto.data?.map(async (data) => {
                const question = await this.repository.findByUuid(data.questionUuid)

                if (question.correct_answer === data.answer || question.correct_answer_ru === data.answer_ru) {
                    res++
                }
            })
        )

        const total: number = dto.data?.length

        return {
            correct: res,
            incorrect: total - res,
            total
        }
    }
}
