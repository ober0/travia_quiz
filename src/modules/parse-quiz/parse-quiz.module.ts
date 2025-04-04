import { Module } from '@nestjs/common'
import { ParseQuizService } from './parse-quiz.service'
import { ParseQuizController } from './parse-quiz.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { PasswordService } from '../password/password.service'
import { UserRepository } from '../user/user.repository'
import { RedisService } from '../redis/redis.service'
import { SmtpService } from '../smtp/smtp.service'
import { CryptService } from '../crypt/crypt.service'
import { RolePermissionService } from '../role-permission/role-permission.service'
import { RolePermissionRepository } from '../role-permission/role-permission.repository'
import { RoleRepository } from '../role/role.repository'
import { RoleService } from '../role/role.service'
import { PermissionService } from '../permission/permission.service'
import { PermissionRepository } from '../permission/permission.repository'
import { UserService } from '../user/user.service'
import { TranslatorService } from '../translator/translator.service'
import { CategoriesRepository } from '../categories/categories.repository'
import { QuestionCountRepository } from '../question/question-count.repository'
import { QuestionRepository } from '../question/question.repository'

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [
        ParseQuizService,
        PrismaService,
        PasswordService,
        UserService,
        UserRepository,
        RedisService,
        RoleService,
        RolePermissionService,
        PermissionService,
        PermissionRepository,
        RolePermissionRepository,
        RoleRepository,
        SmtpService,
        RedisService,
        CryptService,
        CategoriesRepository,
        TranslatorService,
        QuestionCountRepository,
        QuestionRepository
    ],
    controllers: [ParseQuizController]
})
export class ParseQuizModule {}
