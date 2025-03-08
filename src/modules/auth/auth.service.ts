import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PasswordService } from '../password/password.service'
import { TokenService } from '../token/token.service'
import { RedisService } from '../redis/redis.service'
import { SmtpService } from '../smtp/smtp.service'
import { UserRepository } from '../user/user.repository'
import { createHash, randomBytes } from 'crypto'
import { ChangePasswordNoAuthDto, ConfirmChangePasswordDto, ConfirmSignUpUserDto, ResendConfirmCodeDto, SignInUserDto, SignUpResponseUserDto, SignUpUserDto } from './dto'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService')

    constructor(
        private readonly tokenService: TokenService,
        private readonly passwordService: PasswordService,
        private readonly redis: RedisService,
        private readonly smtpService: SmtpService,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService
    ) {}

    private generateVerificationCode(): number {
        return Math.floor(100000 + Math.random() * 900000)
    }

    private async generateHash(length: number = 16): Promise<string> {
        const randomData: string = randomBytes(32).toString('hex')
        const hash: string = createHash('sha256').update(randomData).digest('hex')
        return hash.substring(0, length)
    }

    async signUp(userDto: SignUpUserDto) {
        const user = await this.userRepository.findOneByEmail(userDto.email)
        if (user) {
            throw new ConflictException('Пользователь с таким email уже существует')
        }

        const code: number = this.generateVerificationCode()

        const hash: string = await this.generateHash()

        await this.passwordService.validate(userDto.password)

        const userData: string = JSON.stringify({ ...userDto, code })

        await this.redis.set(`signup-${hash}`, userData, 300)

        await this.smtpService.send(userDto.email, `Ваш код подтверждения: ${code}`, 'Код для подтверждения создания аккаунта')
        const data: SignUpResponseUserDto = {
            msg: 'Код отправляется',
            hash
        }
        return data
    }

    async confirmSignUp(confirmUserDto: ConfirmSignUpUserDto) {
        const userDataString = await this.redis.get(`signup-${confirmUserDto.hash}`)

        if (!userDataString || typeof userDataString !== 'string') {
            throw new NotFoundException('Неверный хэш')
        }

        const userDataJson = JSON.parse(userDataString)
        const { code, ...userDto } = userDataJson

        if (Number(code) !== confirmUserDto.code) {
            throw new BadRequestException('Неверный код')
        }

        await this.redis.delete(`signup-${confirmUserDto.hash}`)
        const { uuid, email } = await this.userService.create(userDto)

        this.logger.log(`Пользователь ${userDto.email} зарегистрировался`)

        return {
            accessToken: await this.tokenService.generateAccessToken(uuid, email),
            refreshToken: await this.tokenService.generateRefreshToken(uuid, email)
        }
    }

    async resendConfirmCode({ hash, action }: ResendConfirmCodeDto) {
        let redisKey: string
        let subject
        switch (action) {
            case 'signin':
                redisKey = `signin-${hash}`
                subject = `Код для подтверждения входа в аккаунт`
                break
            case 'signup':
                redisKey = `signup-${hash}`
                subject = `Код для подтверждения регистрации`
                break
            case 'change-password-no-auth':
                redisKey = `changePasswordNoAuth-${hash}`
                subject = 'Код подтверждения для смены пароля в аккаунте Gravitino Terminal'
                break
            case 'twoFactor':
                redisKey = `twoFactor-${hash}`
                subject = 'Код для изменения 2FA аккаунта Gravitino Terminal'
                break
            default:
                throw new BadRequestException()
        }
        const data: string | number | null = await this.redis.get(redisKey)
        if (!data || typeof data !== 'string') {
            throw new BadRequestException('Время жизни кода истекло')
        }

        const userDataJson = JSON.parse(data)

        const newCode: number = this.generateVerificationCode()

        const newDataJson = { ...userDataJson, code: newCode }

        const newData = JSON.stringify(newDataJson)
        await this.redis.set(redisKey, newData, 300)

        this.smtpService.send(userDataJson.email, `Ваш код подтверждения: ${newCode}`, subject)

        return {
            msg: 'Код отправляется',
            hash
        }
    }

    async signIn(userDto: SignInUserDto, ip: string) {
        let usedAttempts = await this.redis.get(`signin-attempts-${ip}`)
        if (!usedAttempts || typeof usedAttempts != 'string') {
            usedAttempts = 0
        }
        if (Number(usedAttempts) >= 5) {
            throw new BadRequestException('Много попыток')
        }

        const user = await this.userService.findOneByEmail(userDto.email, true)

        if (!(await this.passwordService.comparePassword(userDto.password, user.hashedPassword))) {
            await this.redis.incrementWithTTL(`signin-attempts-${ip}`, 1, 600)
            throw new NotFoundException('Пользователь не найден')
        }

        if (user.twoFactor === false) {
            return {
                accessToken: await this.tokenService.generateAccessToken(user.uuid, user.email),
                refreshToken: await this.tokenService.generateRefreshToken(user.uuid, user.email),
                user
            }
        }

        const code: number = this.generateVerificationCode()
        const hash: string = await this.generateHash()

        const redisData = {
            email: user.email,
            uuid: user.uuid,
            code
        }
        const userData: string = JSON.stringify(redisData)

        await this.redis.set(`signin-${hash}`, userData, 300)

        this.smtpService.send(userDto.email, `Ваш код подтверждения: ${code}`, 'Код для подтверждения входа в аккаунт')

        const data: SignUpResponseUserDto = {
            msg: 'Код отправляется',
            hash
        }
        return data
    }

    async confirmSignIn(confirmUserDto: ConfirmSignUpUserDto, ip: string) {
        let usedAttempts = await this.redis.get(`confirm-attempts-${ip}`)
        if (!usedAttempts || typeof usedAttempts != 'string') {
            usedAttempts = 0
        }
        if (Number(usedAttempts) >= 5) {
            throw new BadRequestException('Много попыток')
        }

        const userDataString = await this.redis.get(`signin-${confirmUserDto.hash}`)

        if (!userDataString || typeof userDataString !== 'string') {
            throw new BadRequestException()
        }

        const userDataJson = JSON.parse(userDataString)
        const { code, ...userDto } = userDataJson

        if (Number(code) !== confirmUserDto.code) {
            await this.redis.incrementWithTTL(`confirm-attempts-${ip}`, 1, 600)
            throw new BadRequestException('Неверный код')
        }

        await this.redis.delete(`signin-${confirmUserDto.hash}`)

        this.logger.log(`Пользователь ${userDto.email} выполнил вход`)

        const user = await this.userService.findOneByUuid(userDto.uuid, false)

        return {
            accessToken: await this.tokenService.generateAccessToken(user.uuid, user.email),
            refreshToken: await this.tokenService.generateRefreshToken(user.uuid, user.email),
            user
        }
    }

    async refresh(refreshToken: string) {
        const payload = await this.tokenService.verifyRefreshToken(refreshToken)
        const newAccessToken = await this.tokenService.generateAccessToken(payload.uuid, payload.email)
        this.logger.log(`Пользователь ${payload.email} получил новый access-token`)
        return { accessToken: newAccessToken }
    }

    async changePassword(dto: ChangePasswordNoAuthDto) {
        const code: number = Math.floor(100000 + Math.random() * 900000)

        const hash: string = await this.generateHash()

        const user = await this.userService.findOneByEmail(dto.email)

        const password_hash = await this.passwordService.hashPassword(dto.password)

        const userData: string = JSON.stringify({ uuid: user.uuid, email: user.email, password_hash, code })

        await this.redis.set(`changePasswordNoAuth-${hash}`, userData, 300)

        this.smtpService.send(user.email, `Ваш код подтверждения: ${code}`, `Код подтверждения для смены пароля`)

        return {
            msg: 'Код отправляется',
            hash
        }
    }

    async confirmChangePassword(ip: string, { hash, code }: ConfirmChangePasswordDto) {
        const userData: string | number = await this.redis.get(`changePasswordNoAuth-${hash}`)
        if (!userData || typeof userData !== 'string') {
            throw new BadRequestException()
        }
        const JsonUserData = JSON.parse(userData)
        const uuid = JsonUserData.uuid

        if (uuid != JsonUserData.uuid) {
            throw new UnauthorizedException('Нет доступа')
        }

        await this.checkConfirmAttempts(ip)

        if (Number(code) !== JsonUserData.code) {
            await this.redis.incrementWithTTL(`confirm-attempts-${ip}`, 1, 600)
            throw new BadRequestException('Неверный код')
        }

        return this.userRepository.updatePassword(uuid, JsonUserData.password_hash)
    }

    private async checkConfirmAttempts(ip: string) {
        let usedAttempts = await this.redis.get(`confirm-attempts-${ip}`)
        if (!usedAttempts || typeof usedAttempts != 'string') {
            usedAttempts = 0
        }
        if (Number(usedAttempts) >= 5) {
            throw new BadRequestException('Много попыток')
        }
        return true
    }
}
