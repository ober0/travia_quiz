import { Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common'
import { ParseQuizService } from './parse-quiz.service'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ActiveGuard } from '../auth/guards/active.guard'
import { PermissionGuard } from '../role-permission/guards/permission.guard'
import { HasPermissions } from '../role-permission/decorators/permissions.decorator'
import { PermissionEnum } from '../../common/constants/permission.enum'
import { JwtAuthGuard } from '../auth/guards/auth.guard'

@ApiTags('Parse quiz')
@ApiSecurity('bearer')
@Controller('parse-quiz')
export class ParseQuizController {
    constructor(private readonly parseQuizService: ParseQuizService) {}

    @Patch()
    // @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    // @HasPermissions(PermissionEnum.AdminMenu)
    @ApiOperation({ summary: 'Запустить обновление вопросов' })
    @HttpCode(HttpStatus.ACCEPTED)
    async startUpdatingQuiz() {
        this.parseQuizService.parseQuizData()
        return {
            msg: 'Обновление запущено'
        }
    }
}
