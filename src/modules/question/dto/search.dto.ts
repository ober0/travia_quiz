import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator'
import { ComplexityEnum } from '../enums/complexity.enum'
import { QuestionTypesEnum } from '../enums/question-types.enum'
import { Type } from 'class-transformer'

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
    @Type(() => Number)
    @Min(10)
    @Max(20)
    @IsNumberString()
    limit: number
}
