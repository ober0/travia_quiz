import { Module } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { UserModule } from '../user/user.module'
import { CategoriesRepository } from './categories.repository'

@Module({
    imports: [UserModule],
    controllers: [CategoriesController],
    providers: [CategoriesService, CategoriesRepository]
})
export class CategoriesModule {}
