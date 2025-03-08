import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { PermissionService } from './permission.service'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'
import { PermissionGuard } from '../role-permission/guards/permission.guard'
import { HasPermissions } from '../role-permission/decorators/permissions.decorator'
import { PermissionEnum } from 'src/common/constants/permission.enum'
import { PermissionResponseDto } from './res'

@ApiTags('Permission')
@ApiSecurity('bearer')
@Controller('permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Get()
    @ApiOkResponse({ type: [PermissionResponseDto] })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.PlanGetAll)
    @ApiOperation({ summary: 'Получение всех прав' })
    async findAll() {
        return this.permissionService.findAll()
    }

    @Get(':uuid')
    @ApiOkResponse({ type: PermissionResponseDto })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.PlanGet)
    @ApiOperation({ summary: 'Получение одного права' })
    async findOne(@Param('uuid') uuid: string) {
        return this.permissionService.findOne(uuid)
    }
}
