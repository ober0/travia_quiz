import { Module } from '@nestjs/common'
import { AnswersController } from './answers.controller'
import { AnswersService } from './answers.service'
import { UserModule } from '../user/user.module'
import { QuestionModule } from '../question/question.module'
import { QuestionRepository } from '../question/question.repository'

@Module({
    imports: [UserModule, QuestionModule],
    controllers: [AnswersController],
    providers: [AnswersService, QuestionRepository]
})
export class AnswersModule {}
