import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class AnswerDto {
    @ApiProperty()
    questionUuid: string

    @ApiProperty({ required: false })
    @IsOptional()
    answer_ru?: string

    @ApiProperty({ required: false })
    @IsOptional()
    answer?: string
}

export class CheckAnswersDto {
    @ApiProperty()
    data: AnswerDto[]
}
