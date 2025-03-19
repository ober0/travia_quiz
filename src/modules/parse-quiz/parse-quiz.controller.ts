import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common'
import { ParseQuizService } from './parse-quiz.service'
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ActiveGuard } from '../auth/guards/active.guard'
import { PermissionGuard } from '../role-permission/guards/permission.guard'
import { HasPermissions } from '../role-permission/decorators/permissions.decorator'
import { PermissionEnum } from '../../common/constants/permission.enum'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { startUpdatingQuizDto } from './dto/index.dto'

@ApiTags('Parse quiz')
@ApiSecurity('bearer')
@Controller('parse-quiz')
export class ParseQuizController {
    constructor(private readonly parseQuizService: ParseQuizService) {}

    @Patch()
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.AdminMenu)
    @ApiOperation({ summary: 'Запустить обновление вопросов' })
    @HttpCode(HttpStatus.ACCEPTED)
    async startUpdatingQuiz(@Body() dto: startUpdatingQuizDto) {
        if (dto.password !== process.env.UPDATE_PASSWORD) {
            return {
                msg: 'Неверный пароль'
            }
        }
        this.parseQuizService.parseQuizData()
        return {
            msg: 'Обновление запущено'
        }
    }
}
