import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as process from 'node:process'

@Injectable()
export class SmtpService {
    private transporter: nodemailer.Transporter
    private readonly logger: Logger = new Logger('SmtpService')
    constructor() {
        this.createTransporter()
    }

    private createTransporter() {
        if (process.env.SMTP_SERVICE.startsWith('smtp.')) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_SERVICE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                port: 465,
                secure: true
            })
        } else {
            this.transporter = nodemailer.createTransport({
                service: process.env.SMTP_SERVICE,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            })
        }
    }

    async send(email: string, text: string, subject: string) {
        const mailOptions = {
            from: `"Travia quiz" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `TRAVIA-QUIZ ${subject}`,
            text
        }

        try {
            await this.transporter.sendMail(mailOptions)
            return {
                success: true
            }
        } catch (error) {
            this.logger.error(error)
            return null
        }
    }
}
