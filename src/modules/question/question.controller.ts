import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { QuestionService } from './question.service'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'
import { QuestionBaseDto, QuestionSearchDto } from './dto/search.dto'

@Controller('question')
@ApiTags('Question')
@ApiSecurity('bearer')
export class QuestionController {
    constructor(private readonly service: QuestionService) {}

    @Get('complexity')
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получить имеющиеся сложности' })
    async getComplexity() {
        return this.service.getComplexity()
    }

    @Get('types')
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получить имеющиеся типы' })
    async getTypes() {
        return this.service.getTypes()
    }

    @Get()
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получить вопросы по теме и сложности' })
    async getQuestions(@Query() dto: QuestionSearchDto) {
        return this.service.getQuestions(dto)
    }

    @Get('count')
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получить вопросы по теме и сложности' })
    async getQuestionsCount(@Query() dto: QuestionBaseDto) {
        return {
            count: await this.service.getQuestionsCount(dto)
        }
    }
}
