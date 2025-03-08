import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { TokenModule } from '../token/token.module'
import { PasswordService } from '../password/password.service'
import { CryptService } from 'src/modules/crypt/crypt.service'
import { SmtpService } from 'src/modules/smtp/smtp.service'
import { RedisService } from 'src/modules/redis/redis.service'
import { UserRepository } from 'src/modules/user/user.repository'
import { PrismaService } from '../prisma/prisma.service'

@Module({
    controllers: [AuthController],
    providers: [AuthService, PasswordService, PrismaService, CryptService, SmtpService, RedisService, UserRepository],
    imports: [forwardRef(() => UserModule), TokenModule],
    exports: [AuthService, TokenModule]
})
export class AuthModule {}
