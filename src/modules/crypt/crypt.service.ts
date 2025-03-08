import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class CryptService {
    private algorithm = 'aes-256-cbc'
    private secretKey: Buffer
    private ivLength = 16

    constructor() {
        const key = process.env.ENCRYPTION_KEY
        this.secretKey = Buffer.from(key, 'base64')

        if (this.secretKey.length !== 32) {
            throw new Error('Invalid ENCRYPTION_KEY: Key must be 32 bytes long after decoding.')
        }
    }

    async encrypt(text: string): Promise<string> {
        const iv = crypto.randomBytes(this.ivLength)
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv)
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`
    }

    async decrypt(encryptedText: string): Promise<string> {
        const [iv, encrypted] = encryptedText.split(':')
        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, Buffer.from(iv, 'hex'))
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()])
        return decrypted.toString()
    }
}
