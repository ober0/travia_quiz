import { Module } from '@nestjs/common'
import { QuestionService } from './question.service'
import { QuestionController } from './question.controller'
import { UserModule } from '../user/user.module'
import { QuestionRepository } from './question.repository'
import { QuestionCountRepository } from './question-count.repository'

@Module({
    imports: [UserModule],
    providers: [QuestionService, QuestionRepository, QuestionCountRepository],
    controllers: [QuestionController]
})
export class QuestionModule {}
