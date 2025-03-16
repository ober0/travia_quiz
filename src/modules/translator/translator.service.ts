import { Injectable, Logger } from '@nestjs/common'
import * as translate from 'translate-google'
import { TranslateTextDro } from './dto/index.dto'

@Injectable()
export class TranslatorService {
    private readonly logger = new Logger(TranslatorService.name)

    private async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async translateText(dto: TranslateTextDro): Promise<Record<string, string>> {
        let retries = 3
        while (retries > 0) {
            try {
                const translatedText = await translate(dto.text, { from: dto.from, to: dto.to })
                return {
                    status: 'OK',
                    text: translatedText
                }
            } catch (error) {
                this.logger.error('Ошибка перевода:', error)

                if (error.code === 'ERR_NON_2XX_3XX_RESPONSE' && error.response?.statusCode === 429) {
                    this.logger.warn(`Превышен лимит запросов. Ждем 60 секунд перед повторной попыткой...`)
                    await this.delay(60000)
                    retries--
                } else {
                    return {
                        status: 'ERROR',
                        message: error.message || 'Unknown error',
                        text: dto.text
                    }
                }
            }
        }
        return {
            status: 'ERROR',
            message: 'Превышено количество попыток перевода',
            text: dto.text
        }
    }
}
