import { forwardRef, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { AuthModule } from '../auth/auth.module'
import { PasswordService } from '../password/password.service'
import { PasswordModule } from '../password/password.module'
import { UserRepository } from './user.repository'
import { RedisService } from 'src/modules/redis/redis.service'
import { SmtpService } from 'src/modules/smtp/smtp.service'
import { CryptService } from 'src/modules/crypt/crypt.service'
import { PrismaService } from '../prisma/prisma.service'
import { RoleModule } from '../role/role.module'

@Module({
    controllers: [UserController],
    providers: [UserService, PrismaService, PasswordService, UserRepository, RedisService, SmtpService, CryptService],
    imports: [forwardRef(() => AuthModule), forwardRef(() => RoleModule), PasswordModule],
    exports: [UserService, UserRepository]
})
export class UserModule {}
