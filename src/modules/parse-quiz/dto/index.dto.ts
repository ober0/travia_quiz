import { ApiProperty } from '@nestjs/swagger'

export class startUpdatingQuizDto {
    @ApiProperty()
    password: string
}
