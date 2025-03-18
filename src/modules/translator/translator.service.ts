import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PromptEnum, sendJsonMessageDto, TranslateTextDro } from './dto/index.dto'
import axios from 'axios'
import * as tunnel from 'tunnel'

@Injectable()
export class TranslatorService {
    private readonly logger = new Logger(TranslatorService.name)

    private async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    private readonly apiKey: string = process.env.OPENAI_API_KEY

    private readonly apiTextUrl: string = 'https://api.openai.com/v1/chat/completions'
    private readonly reserveApiTextUrl: string = 'https://gpt-proxy.gravitino.ru/v1/chat/completions'

    private readonly agent = tunnel.httpsOverHttp({
        proxy: {
            host: process.env.PROXY_HOST,
            port: Number(process.env.PROXY_PORT),
            proxyAuth: process.env.PROXY_AUTH
        }
    })

    async translateText(dto: TranslateTextDro) {
        const messages = [
            {
                role: 'developer',
                content: 'Ты робот переводчик с английского на русский. не переводи имена, true/false, числа, события, места и тд. т.е в переводе оставь исходную версию, но не пропускай ее'
            },
            { role: 'user', content: `${PromptEnum.Prompt} Вот данные: ${dto.data}` }
        ]
        return await this.sendJsonMessage({
            temperature: 0.4,
            answerCount: 1,
            messages
        })
    }

    private async makeRequest(url: string, data: any, useAgent: boolean = true) {
        try {
            const response = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                ...(useAgent ? { httpsAgent: this.agent } : {})
            })
            return response.data.choices[0].message.content.trim()
        } catch (error) {
            this.logger.error(`Ошибка при запросе к OpenAI API: ${error.message}`)

            // Проверяем код ошибки
            const shouldUseReserve =
                error.code === 'ECONNRESET' ||
                error.code === 'ECONNREFUSED' ||
                error.response?.status === 429 ||
                error.response?.status === 403 ||
                (error.response?.status && error.response.status >= 500)

            if (shouldUseReserve && url !== this.reserveApiTextUrl) {
                this.logger.warn('Используем резервный OpenAI API URL без прокси...')
                return this.makeRequest(this.reserveApiTextUrl, data, false)
            }

            throw new InternalServerErrorException('Не удалось проанализировать текст')
        }
    }

    async sendJsonMessage(dto: sendJsonMessageDto) {
        return this.makeRequest(this.apiTextUrl, {
            model: 'gpt-4o-mini',
            store: true,
            temperature: dto.temperature,
            messages: dto.messages,
            response_format: PromptEnum.JsonSchema
        })
    }
}
