import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { RoleService } from './role.service'
import { ApiCreatedResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { RoleCreateDto, RoleUpdateDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'
import { PermissionGuard } from '../role-permission/guards/permission.guard'
import { HasPermissions } from '../role-permission/decorators/permissions.decorator'
import { PermissionEnum } from 'src/common/constants/permission.enum'
import { RoleResponseDto } from './res'

@ApiTags('Role')
@ApiSecurity('bearer')
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @ApiCreatedResponse({ type: RoleResponseDto })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.RoleCreate)
    @ApiOperation({ summary: 'Создание роли' })
    async create(@Body() roleDto: RoleCreateDto) {
        return this.roleService.create(roleDto)
    }

    @Get(':uuid')
    @ApiCreatedResponse({ type: RoleResponseDto })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.RoleGet)
    @ApiOperation({ summary: 'Получение одной роли' })
    async findOne(@Param('uuid') uuid: string) {
        return this.roleService.findOne(uuid)
    }

    @Get()
    @ApiCreatedResponse({ type: [RoleResponseDto] })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.RoleGetAll, PermissionEnum.RolePermissionGetAll, PermissionEnum.PermissionGetAll)
    @ApiOperation({ summary: 'Получение всех ролей' })
    async findAll() {
        return this.roleService.findAll()
    }

    @Patch(':uuid')
    @ApiCreatedResponse({ type: RoleResponseDto })
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.RoleUpdate)
    @ApiOperation({ summary: 'Обновление роли' })
    async update(@Param('uuid') uuid: string, @Body() roleDto: RoleUpdateDto) {
        return this.roleService.update(uuid, roleDto)
    }

    @Delete(':uuid')
    @UseGuards(JwtAuthGuard, ActiveGuard, PermissionGuard)
    @HasPermissions(PermissionEnum.RoleDelete)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удаление роли' })
    async delete(@Param('uuid') id: string) {
        return this.roleService.delete(id)
    }
}
