import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../auth/guards/auth.guard'
import { ActiveGuard } from '../auth/guards/active.guard'

@Controller('categories')
@ApiTags('Categories')
@ApiSecurity('bearer')
export class CategoriesController {
    constructor(private readonly service: CategoriesService) {}

    @Get()
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получить список категорий' })
    async getCategories() {
        return this.service.getCategories()
    }
}
