import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from '../prisma/prisma.module'
import { RedisModule } from '../redis/redis.module'
import { CryptModule } from '../crypt/crypt.module'
import { PasswordModule } from '../password/password.module'
import { SmtpModule } from '../smtp/smtp.module'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../user/user.module'
import { ConfigModule } from '@nestjs/config'
import config from 'src/config/config'

@Module({
    imports: [PrismaModule, RedisModule, CryptModule, PasswordModule, SmtpModule, UserModule, AuthModule, ConfigModule.forRoot({ isGlobal: true, load: [config] })],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
