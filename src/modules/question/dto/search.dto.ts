import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { ComplexityEnum } from '../enums/complexity.enum'
import { QuestionTypesEnum } from '../enums/question-types.enum'

export class QuestionBaseDto {
    @ApiProperty({ required: false })
    @IsOptional()
    complexity?: ComplexityEnum

    @ApiProperty({ required: false })
    @IsOptional()
    type?: QuestionTypesEnum

    @ApiProperty({ required: false })
    @IsOptional()
    category_uuid?: string
}

export class QuestionSearchDto extends QuestionBaseDto {
    @ApiProperty({ required: true })
    limit: 10 | 15 | 20
}
