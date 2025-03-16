import { Module } from '@nestjs/common'
import { TranslatorService } from './translator.service'

@Module({
    providers: [TranslatorService]
})
export class TranslatorModule {}
