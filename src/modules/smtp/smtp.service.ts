import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as process from 'node:process'

@Injectable()
export class SmtpService {
    private transporter: nodemailer.Transporter

    constructor() {
        this.createTransporter()
    }

    private createTransporter() {
        this.transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async send(email: string, text: string, subject: string) {
        const mailOptions = {
            from: process.env.SMTP_SERVICE,
            to: email,
            subject,
            text
        }

        try {
            await this.transporter.sendMail(mailOptions)
            return {
                success: true
            }
        } catch {
            return null
        }
    }
}
