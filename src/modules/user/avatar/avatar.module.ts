import { forwardRef, Module } from '@nestjs/common'
import { AvatarService } from './avatar.service'
import { AuthModule } from 'src/modules/auth/auth.module'
import { PasswordModule } from 'src/modules/password/password.module'
import { AvatarController } from 'src/modules/user/avatar/avatar.controller'
import { UserService } from 'src/modules/user/user.service'
import { PasswordService } from 'src/modules/password/password.service'
import { UserRepository } from 'src/modules/user/user.repository'
import { RedisService } from 'src/modules/redis/redis.service'
import { SmtpService } from 'src/modules/smtp/smtp.service'
import { CryptService } from 'src/modules/crypt/crypt.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RoleModule } from '../../role/role.module'

@Module({
    controllers: [AvatarController],
    providers: [AvatarService, UserService, PrismaService, PasswordService, UserRepository, RedisService, SmtpService, CryptService],
    imports: [forwardRef(() => AuthModule), forwardRef(() => RoleModule), PasswordModule]
})
export class AvatarModule {}
