import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtPayloadDto } from '../auth/dto'

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(uuid: string, email: string): Promise<string> {
        return this.jwtService.sign({ uuid, email })
    }

    async generateRefreshToken(uuid: string, email: string): Promise<string> {
        return this.jwtService.sign(
            { uuid, email },
            {
                secret: process.env.REFRESH_SECRET,
                expiresIn: '7d'
            }
        )
    }

    async verifyRefreshToken(token: string): Promise<JwtPayloadDto> {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.REFRESH_SECRET
            })
        } catch {
            throw new UnauthorizedException()
        }
    }
}
