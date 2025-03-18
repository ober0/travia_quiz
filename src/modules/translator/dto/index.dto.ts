export class TranslateTextDro {
    data: any
}

export class sendJsonMessageDto {
    temperature: number
    answerCount: number
    messages: any[]
}

export class PromptEnum {
    static Prompt: 'У вас есть массив объектов вида {id: string, text: }, где text - это массив фраз на английском языке. Пожалуйста, переведите все фразы в массиве text на русский язык, сохраняя порядок. Верните аналогичный массив объектов с переведенными фразами. так же удаляй спец символы по типу &quot'
    static JsonSchema = {
        type: 'json_schema',
        json_schema: {
            name: 'translate_schema',
            schema: {
                type: 'object',
                properties: {
                    entries: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'uuid соответствующего текста на английском, который ты перевел'
                                },
                                text: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    minItems: 1,
                                    maxItems: 4,
                                    description: 'Массив переведенных фраз в том же порядке, в котором они были получены.'
                                }
                            },
                            required: ['id', 'text'],
                            additionalProperties: false
                        }
                    }
                },
                required: ['entries'],
                additionalProperties: false
            }
        }
    }
}
