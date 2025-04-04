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
import { AvatarModule } from '../user/avatar/avatar.module'
import { ParseQuizModule } from '../parse-quiz/parse-quiz.module'
import { TranslatorModule } from '../translator/translator.module'
import { QuestionModule } from '../question/question.module'
import { CategoriesModule } from '../categories/categories.module'
import { AnswersModule } from '../answers/answers.module'

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        CryptModule,
        PasswordModule,
        SmtpModule,
        UserModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true, load: [config] }),
        AvatarModule,
        TranslatorModule,
        ParseQuizModule,
        QuestionModule,
        CategoriesModule,
        AnswersModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
