import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleCreateDto, RoleUpdateDto } from './dto'
import { PermissionService } from '../permission/permission.service'
import { RoleRepository } from './role.repository'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RoleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roleRepository: RoleRepository,
        private readonly permissionService: PermissionService
    ) {}

    async create({ permissions, ...roleDto }: RoleCreateDto) {
        await this.ensureRoleNameUnique(roleDto.name)
        this.ensurePermissionsAreUnique(permissions)
        await this.ensurePermissionsExist(permissions)

        return this.prisma.$transaction(async (transactionClient) => {
            const newRole = await this.roleRepository.create(roleDto, transactionClient)
            await this.roleRepository.createRolePermissions(
                permissions.map((permissionUuid) => ({
                    roleUuid: newRole.uuid,
                    permissionUuid
                })),
                transactionClient
            )
            return newRole
        })
    }

    async update(roleUuid: string, { permissions, ...roleDto }: RoleUpdateDto) {
        await this.ensureRoleExists(roleUuid)
        this.ensurePermissionsAreUnique(permissions)
        await this.ensurePermissionsExist(permissions)

        return this.prisma.$transaction(async (transactionClient) => {
            const updatedRole = await this.roleRepository.update(roleUuid, roleDto, transactionClient)
            await this.roleRepository.deleteRolePermissions(roleUuid, transactionClient)
            await this.roleRepository.createRolePermissions(
                permissions.map((permissionUuid) => ({
                    roleUuid,
                    permissionUuid
                })),
                transactionClient
            )
            return updatedRole
        })
    }

    async findOne(uuid: string) {
        const roleWithPermissions = await this.prisma.role.findUnique({
            where: { uuid },
            select: {
                uuid: true,
                name: true,
                rolePermissions: {
                    select: {
                        permission: {
                            select: {
                                uuid: true,
                                name: true,
                                description: true
                            }
                        }
                    }
                }
            }
        })
        if (!roleWithPermissions) throw new NotFoundException('Роль не найдена')
        return roleWithPermissions
    }

    async findOneByName(name: string) {
        const role = await this.roleRepository.findByName(name)
        if (!role) throw new NotFoundException('Роль не найдена')
        return role
    }

    async findAll() {
        const roles = await this.prisma.role.findMany({
            select: {
                uuid: true,
                name: true,
                rolePermissions: {
                    select: {
                        permission: {
                            select: {
                                uuid: true,
                                name: true,
                                description: true
                            }
                        }
                    }
                }
            }
        })
        if (!roles.length) {
            throw new NotFoundException('Роли не найдены')
        }
        return roles
    }

    async delete(uuid: string) {
        await this.ensureRoleExists(uuid)
        return this.roleRepository.delete(uuid)
    }

    private async ensureRoleNameUnique(name: string) {
        if (await this.roleRepository.existsByName(name)) {
            throw new ConflictException('Роль существует')
        }
    }

    private async ensureRoleExists(uuid: string) {
        if (!(await this.roleRepository.existsByUuid(uuid))) {
            throw new NotFoundException('Роль не найдена')
        }
    }

    private ensurePermissionsAreUnique(permissions: string[]) {
        if (new Set(permissions).size !== permissions.length) {
            throw new BadRequestException('Дубликат')
        }
    }

    private async ensurePermissionsExist(permissions: string[]) {
        if (!(await this.permissionService.existsMany(permissions))) {
            throw new NotFoundException()
        }
    }
}
