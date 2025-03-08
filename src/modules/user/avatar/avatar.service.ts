import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AvatarService {
    constructor(private readonly prisma: PrismaService) {}

    async uploadAvatar(uuid: string, filename: string) {
        return this.prisma.user.update({
            where: { uuid },
            data: { avatar: filename }
        })
    }

    async getAvatar(uuid: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { uuid },
            select: { avatar: true }
        })

        if (!user || !user.avatar) {
            user.avatar = null
        }

        return user.avatar
    }
}
