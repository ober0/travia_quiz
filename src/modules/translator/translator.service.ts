import { Injectable, Logger } from '@nestjs/common'
import * as translate from 'translate-google'
import { TranslateTextDro } from './dto/index.dto'

@Injectable()
export class TranslatorService {
    private readonly logger = new Logger(TranslatorService.name)

    async translateText(dto: TranslateTextDro): Promise<Record<string, string>> {
        try {
            const translatedText = await translate(dto.text, { from: dto.from, to: dto.to })
            return {
                status: 'OK',
                text: translatedText
            }
        } catch (error) {
            this.logger.error('Ошибка перевода:', error)
            return {
                status: 'ERROR',
                message: error.message || 'Unknown error',
                text: dto.text
            }
        }
    }
}
