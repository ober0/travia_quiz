import { Body, Controller, Get, Patch, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'
import { JwtPayload } from '../auth/decorators/jwt-payload.decorator'
import { ConfirmTwoFactorDto, JwtPayloadDto, SelfUserUpdateDto, TwoFactorAuthDto } from '../auth/dto'
import { Request } from 'express'

@ApiTags('User/Main')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Проверка информации о себе' })
    @Get('self')
    @UseGuards(JwtAuthGuard)
    async findOne(@JwtPayload() jwtPayload: JwtPayloadDto) {
        return this.userService.findOneByUuid(jwtPayload.uuid, false)
    }

    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Изменить информацию о себе' })
    @Patch()
    @UseGuards(JwtAuthGuard, ActiveGuard)
    async update(@JwtPayload() jwtPayload: JwtPayloadDto, @Body() dto: SelfUserUpdateDto) {
        return this.userService.update(jwtPayload.uuid, dto)
    }

    @ApiSecurity('bearer')
    @Post('two-factor-auth')
    @ApiOperation({ summary: 'Запрос кода для подтверждения Отключения/Включения двухфакторки' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, ActiveGuard)
    async twoFactorAuth(@Body() twoFactorAuthDto: TwoFactorAuthDto, @JwtPayload() jwtPayload: JwtPayloadDto) {
        return this.userService.twoFactorAuth(jwtPayload.uuid, twoFactorAuthDto)
    }

    @ApiSecurity('bearer')
    @Patch('two-factor-auth')
    @ApiOperation({ summary: 'Отключение/Включение двухфакторки' })
    @UseGuards(JwtAuthGuard, ActiveGuard)
    async confirmTwoFactorAuth(@JwtPayload() jwtPayload: JwtPayloadDto, @Req() req: Request, @Body() dto: ConfirmTwoFactorDto) {
        return this.userService.confirmTwoFactorAuth(req.ip, jwtPayload.uuid, dto)
    }
}
