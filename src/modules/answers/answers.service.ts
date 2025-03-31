import { Injectable } from '@nestjs/common'
import { QuestionRepository } from '../question/question.repository'
import { CheckAnswersDto } from './dto/answers.dto'
import { CoinsConst } from '../question/consts/coins.const'
import { UserRepository } from '../user/user.repository'

@Injectable()
export class AnswersService {
    constructor(
        private readonly repository: QuestionRepository,
        private readonly userRepository: UserRepository
    ) {}

    async checkAnswers(dto: CheckAnswersDto, userUuid: string) {
        let res: number = 0
        let coins: number = 0

        await Promise.all(
            dto.data?.map(async (data) => {
                const question = await this.repository.findByUuid(data.questionUuid)

                if (question.correct_answer === data.answer || question.correct_answer_ru === data.answer_ru) {
                    res++
                    coins += CoinsConst[question.difficulty]
                }
            })
        )

        const total: number = dto.data?.length

        await this.userRepository.addCoins(coins, userUuid)

        return {
            correct: res,
            coins: coins,
            incorrect: total - res,
            total
        }
    }
}
