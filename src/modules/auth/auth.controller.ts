import { Controller, Post, Body, HttpStatus, HttpCode, Get, Query, Req, Patch } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
    ChangePasswordNoAuthDto,
    ConfirmChangePasswordDto,
    ConfirmSignUpUserDto,
    RefreshTokenDto,
    ResendConfirmCodeDto,
    SignInResponseUserDto,
    SignInUserDto,
    SignUpResponseUserDto,
    SignUpUserDto
} from './dto'
import { AccessRefreshTokenResponseDto, AccessTokenResponseDto, LoginResponseDto } from './res'
import { Request } from 'express'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ApiOkResponse({ type: SignUpResponseUserDto })
    @ApiOperation({ summary: 'Регистрация пользователя' })
    async signUp(@Body() signUpDto: SignUpUserDto) {
        return this.authService.signUp(signUpDto)
    }

    @Post('signup/confirm')
    @ApiOkResponse({ type: AccessRefreshTokenResponseDto })
    @ApiOperation({ summary: 'Подтверждение регистрации по email' })
    async confirmSignUp(@Body() signUpDto: ConfirmSignUpUserDto) {
        return this.authService.confirmSignUp(signUpDto)
    }

    @Post('signin')
    @ApiOkResponse({ type: SignInResponseUserDto })
    @ApiOperation({ summary: 'Вход пользователя' })
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() signInDto: SignInUserDto, @Req() request: Request) {
        return this.authService.signIn(signInDto, request.ip)
    }

    @Post('signin/confirm')
    @ApiOkResponse({ type: LoginResponseDto })
    @ApiOperation({ summary: 'Подтверждение входа по email' })
    @HttpCode(HttpStatus.OK)
    async confirmSignIn(@Body() confirmUserDto: ConfirmSignUpUserDto, @Req() request: Request) {
        return this.authService.confirmSignIn(confirmUserDto, request.ip)
    }

    @Post('refresh')
    @ApiOkResponse({ type: AccessTokenResponseDto })
    @ApiOperation({ summary: 'Получение нового access-токена' })
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() { refreshToken }: RefreshTokenDto) {
        return this.authService.refresh(refreshToken)
    }

    @Get('resend-code')
    @ApiOkResponse({ type: SignUpResponseUserDto })
    @ApiOperation({ summary: 'Отправка нового кода на почту' })
    @HttpCode(HttpStatus.OK)
    async resendConfirmCode(@Query() hashDto: ResendConfirmCodeDto) {
        return this.authService.resendConfirmCode(hashDto)
    }

    @ApiOperation({ summary: 'Запрос на смену пароля (для НЕ авторизованных пользователей)' })
    @Post('change-password')
    async changePassword(@Body() dto: ChangePasswordNoAuthDto) {
        return this.authService.changePassword(dto)
    }

    @ApiOperation({ summary: 'Подтвердить смену пароля (для НЕ авторизованных пользователей)' })
    @Patch('change-password/confirm')
    async confirmChangePassword(@Req() req: Request, @Body() dto: ConfirmChangePasswordDto) {
        return this.authService.confirmChangePassword(req.ip, dto)
    }
}
