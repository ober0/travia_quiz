import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { AnswersService } from './answers.service'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'
import { CheckAnswersDto } from './dto/answers.dto'

@Controller('answers')
@ApiTags('Answers')
@ApiSecurity('bearer')
export class AnswersController {
    constructor(private readonly service: AnswersService) {}

    @Post()
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Проверка ответов' })
    @HttpCode(200)
    async checkAnswers(@Body() dto: CheckAnswersDto) {
        return this.service.checkAnswers(dto)
    }
}
