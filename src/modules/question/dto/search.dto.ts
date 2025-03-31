import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator'
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
    @ApiProperty({ required: true, enum: [10, 15, 20] })
    @IsIn([10, 15, 20])
    @IsNumber()
    limit: 10 | 15 | 20
}
