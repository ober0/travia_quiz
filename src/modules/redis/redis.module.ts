import { Module, Global } from '@nestjs/common'
import Redis from 'ioredis'
import { RedisService } from './redis.service'
import { SmtpService } from 'src/modules/smtp/smtp.service'
import { CryptService } from 'src/modules/crypt/crypt.service'
import { PrismaService } from '../prisma/prisma.service'

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                const redisUrl = process.env.REDIS_URL

                return new Redis(redisUrl)
            }
        },
        RedisService,
        SmtpService,
        PrismaService,
        CryptService
    ],
    exports: ['REDIS_CLIENT', RedisService]
})
export class RedisModule {}
