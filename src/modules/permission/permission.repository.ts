import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PermissionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.permission.findMany()
    }

    async findOne(uuid: string) {
        return this.prisma.permission.findUnique({ where: { uuid } })
    }

    async exists(uuid: string): Promise<boolean> {
        const result = await this.prisma.$queryRaw<{ exists: boolean }[]>`
            SELECT EXISTS(
				SELECT 1 
				FROM "Permission" 
				WHERE "uuid" = ${uuid})
        `
        return result[0]?.exists || false
    }

    async existsMany(uuids: string[]): Promise<boolean> {
        const permissionExistsResults = await Promise.all(uuids.map((uuid) => this.exists(uuid)))
        return permissionExistsResults.every((exists) => exists)
    }
}
