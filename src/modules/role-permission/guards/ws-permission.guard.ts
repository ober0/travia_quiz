import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolePermissionService } from '../role-permission.service'
import { PermissionEnum } from 'src/common/constants/permission.enum'
import { Socket } from 'socket.io'

@Injectable()
export class WsPermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rolesPermissionsService: RolePermissionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<PermissionEnum[]>('permissions', [context.getHandler(), context.getClass()])
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true
        }
        const client: Socket = context.switchToWs().getClient<Socket>()
        const user = client.data.user
        if (!user) {
            await this._handleError(client)
            return false
        }
        const hasAllPermissions = await this.hasAllPermissions(requiredPermissions, user.uuid)
        if (!hasAllPermissions) {
            await this._handleError(client)
            return false
        }
        return true
    }

    private async hasAllPermissions(requiredPermissions: PermissionEnum[], userUuid: string): Promise<boolean> {
        const permissionsCheckResults = await Promise.all(requiredPermissions.map((permission) => this.rolesPermissionsService.checkPermission(permission, userUuid)))
        return permissionsCheckResults.every((result) => result)
    }

    private async _handleError(client: Socket) {
        client.emit('error', 'Access denied')
        client.disconnect()
    }
}
