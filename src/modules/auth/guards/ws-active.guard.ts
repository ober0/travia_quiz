import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { UserService } from 'src/modules/user/user.service'
import { Socket } from 'socket.io'

@Injectable()
export class WsActiveGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>()
        const user = client.data.user
        if (!user || !user.uuid) {
            this._handleError(client, 'User not found')
            return false
        }
        const canActivate = await this.userService.findOneByUuid(user.uuid, false)
        if (canActivate.isActive && !canActivate.isForbidden) {
            return true
        } else if (!canActivate.isActive) {
            this._handleError(client, 'deactivated', true)
            return false
        } else if (canActivate.isForbidden) {
            this._handleError(client, 'forbidden')
            return false
        }
        this._handleError(client, 'Unauthorized', true)
        return false
    }

    private _handleError(client: Socket, message: string, disconnect = false) {
        client.emit('error', { message })
        if (disconnect) {
            client.disconnect()
        }
    }
}
