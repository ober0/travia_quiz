import { Module } from '@nestjs/common'
import { SmtpService } from 'src/modules/smtp/smtp.service'

@Module({
    exports: [SmtpService],
    providers: [SmtpService]
})
export class SmtpModule {}
