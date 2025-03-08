import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { UserService } from 'src/modules/user/user.service'

@Injectable()
export class ActiveGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest()

        const canActivate = await this.userService.findOneByUuid(user.uuid)

        if (canActivate.isActive && !canActivate.isForbidden) {
            return true
        } else if (!canActivate.isActive) {
            throw new ForbiddenException('Пользователь деактивирован')
        } else if (canActivate.isForbidden) {
            throw new UnauthorizedException('Пользователь заблокирован')
        }
        throw new UnauthorizedException()
    }
}
