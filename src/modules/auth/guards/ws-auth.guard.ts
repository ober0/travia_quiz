import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Socket } from 'socket.io'

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>()
        const token = await this.extractTokenFromHandshake(client)
        if (!token) {
            this._handleError(client, 'Token not found')
            return false
        }
        try {
            const payload = this.jwtService.verify(token)
            client.data.user = payload
            return true
        } catch (err) {
            this._handleError(client, 'Invalid token')
            return false
        }
    }

    private async extractTokenFromHandshake(client: Socket): Promise<string | null> {
        const authHeader = client.handshake.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7, authHeader.length)
        }
        return null
    }

    private async _handleError(client: Socket, message: string) {
        client.emit('error', { message })
        client.disconnect()
    }
}
