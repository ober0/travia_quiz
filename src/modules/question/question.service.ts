import { Injectable } from '@nestjs/common'
import { ComplexityEnum } from './enums/complexity.enum'
import { QuestionSearchDto } from './dto/search.dto'
import { QuestionRepository } from './question.repository'
import { QuestionTypesEnum } from './enums/question-types.enum'

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
        return this.repository.find(dto)
    }
}
