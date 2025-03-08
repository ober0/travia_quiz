import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PermissionRepository } from './permission.repository'

@Injectable()
export class PermissionService {
    private readonly logger = new Logger('Permission')

    constructor(private readonly permissionRepository: PermissionRepository) {}

    async findAll() {
        const permissions = await this.permissionRepository.findAll()
        if (!permissions.length) {
            this.logger.error(`Права не найдены`)
            throw new NotFoundException('Права не найдены')
        }
        this.logger.log(`Права найдены: ${permissions.length}`)
        return permissions
    }

    async findOne(uuid: string) {
        const permission = await this.permissionRepository.findOne(uuid)
        if (!permission) {
            this.logger.error(`Право ${uuid} не найдено`)
            throw new NotFoundException(`Право ${uuid} не найдено`)
        }
        this.logger.log(`Право ${permission.name} найдено`)
        return permission
    }

    async exists(uuid: string) {
        return this.permissionRepository.exists(uuid)
    }

    async existsMany(uuids: string[]): Promise<boolean> {
        return this.permissionRepository.existsMany(uuids)
    }
}
