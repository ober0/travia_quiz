import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { ConfirmChangePasswordDto, SelfUserUpdateDto, SignUpUserDto, TwoFactorAuthDto } from '../auth/dto'
import { PasswordService } from '../password/password.service'
import { UserRepository } from './user.repository'
import { createHash, randomBytes } from 'crypto'
import { RedisService } from 'src/modules/redis/redis.service'
import { SmtpService } from 'src/modules/smtp/smtp.service'
import * as fs from 'fs'
import { RoleService } from '../role/role.service'

@Injectable()
export class UserService {
    constructor(
        private readonly roleService: RoleService,
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly redis: RedisService,
        private readonly smtpService: SmtpService
    ) {}

    async create(userDto: SignUpUserDto) {
        if (await this.userRepository.existsByEmail(userDto.email)) {
            throw new ConflictException('Пользователь с таким email существует')
        }

        const roleUuid = (await this.roleService.findOneByName('user')).uuid
        const hashedPassword = await this.passwordService.hashPassword(userDto.password)
        delete userDto.password

        return this.userRepository.create({
            ...userDto,
            hashedPassword,
            role: { connect: { uuid: roleUuid } }
        })
    }

    async findOneByEmail(email: string, withPassword: boolean = true) {
        const user = await this.userRepository.findOneByEmail(email)
        if (!user) {
            throw new NotFoundException('Пользователь не найден')
        }
        if (!withPassword) {
            delete user.hashedPassword
        }
        return user
    }

    async findOneByUuid(uuid: string, withPassword: boolean = true) {
        const user = await this.userRepository.findOneByUuid(uuid)
        if (!user) {
            throw new NotFoundException('Пользователь не найден')
        }

        const logoPath = `./media/users/avatars/${user.avatar}`
        const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath, { encoding: 'base64' }) : null

        const avatar = logoBase64 ? `data:image/png;base64,${logoBase64}` : null

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, roleUuid, ...userWithoutSensitiveInfo } = user
        if (!withPassword) {
            return { ...userWithoutSensitiveInfo, avatar }
        }
        return { ...userWithoutSensitiveInfo, hashedPassword, avatar }
    }

    async update(uuid: string, userUpdateDto: SelfUserUpdateDto) {
        return this.userRepository.update(uuid, userUpdateDto)
    }

    private async generateHash(length: number = 16): Promise<string> {
        const randomData: string = randomBytes(32).toString('hex')
        const hash: string = createHash('sha256').update(randomData).digest('hex')
        return hash.substring(0, length)
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

    async twoFactorAuth(uuid: string, twoFactorAuthDto: TwoFactorAuthDto) {
        const code: number = Math.floor(100000 + Math.random() * 900000)

        const hash: string = await this.generateHash()

        const user = await this.findOneByUuid(uuid)

        const userData: string = JSON.stringify({ uuid, on: twoFactorAuthDto.on, code, email: user.email })

        await this.redis.set(`twoFactor-${hash}`, userData, 300)

        this.smtpService.send(user.email, `Ваш код подтверждения: ${code}`, `Код подтверждения ${twoFactorAuthDto.on ? 'включения' : 'отключения'} 2FA`)

        return {
            msg: 'Код отправляется',
            hash
        }
    }

    async confirmTwoFactorAuth(ip: string, uuid: string, { hash, code }: ConfirmChangePasswordDto) {
        const userData: string | number = await this.redis.get(`twoFactor-${hash}`)
        if (!userData || typeof userData !== 'string') {
            throw new NotFoundException()
        }
        const JsonUserData = JSON.parse(userData)

        if (uuid != JsonUserData.uuid) {
            throw new UnauthorizedException('Нет доступа')
        }

        await this.checkConfirmAttempts(ip)

        if (Number(code) !== JsonUserData.code) {
            await this.redis.incrementWithTTL(`confirm-attempts-${ip}`, 1, 600)
            throw new BadRequestException('Неверный код')
        }

        return this.userRepository.updateTwoFactor(uuid, { on: JsonUserData.on })
    }
}
