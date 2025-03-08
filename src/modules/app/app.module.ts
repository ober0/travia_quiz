import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from '../prisma/prisma.module'
import { RedisModule } from '../redis/redis.module'
import { CryptModule } from '../crypt/crypt.module'
import { PasswordModule } from '../password/password.module'
import { SmtpModule } from '../smtp/smtp.module'

@Module({
    imports: [PrismaModule, RedisModule, CryptModule, PasswordModule, SmtpModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
