import * as bcrypt from 'bcryptjs'
import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class PasswordService {
    async hashPassword(password: string): Promise<string> {
        await this.validate(password)

        const salt = await bcrypt.genSalt(2)
        return bcrypt.hash(password, salt)
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword)
    }

    async validate(password: string): Promise<boolean> {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

        if (!passwordRegex.test(password)) {
            throw new BadRequestException('Некорректный пароль')
        }
        return true
    }
}
