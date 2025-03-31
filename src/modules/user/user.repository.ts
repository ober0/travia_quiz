import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { SelfUserUpdateDto, TwoFactorAuthDto } from 'src/modules/auth/dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({ data })
    }

    async findOneByEmail(email: string) {
        return this.prisma.user.findFirst({
            where: { email },
            include: {
                role: true
            }
        })
    }

    async findOneByUuid(uuid: string) {
        return this.prisma.user.findFirst({
            where: { uuid },
            include: {
                role: true
            }
        })
    }

    async existsByEmail(email: string): Promise<boolean> {
        const result = await this.prisma.$queryRaw<{ exists: boolean }[]>`
            SELECT EXISTS(SELECT 1 FROM "User" WHERE "email" = ${email})
        `
        return result[0]?.exists || false
    }

    async existsByUuid(uuid: string): Promise<boolean> {
        const result = await this.prisma.$queryRaw<{ exists: boolean }[]>`
            SELECT EXISTS(SELECT 1 FROM "User" WHERE "uuid" = ${uuid})
        `
        return result[0]?.exists || false
    }

    async update(uuid: string, userUpdateDto: SelfUserUpdateDto) {
        return this.prisma.user.update({
            where: { uuid },
            data: userUpdateDto
        })
    }

    async updatePassword(uuid: string, password_hash: string) {
        return this.prisma.user.update({
            where: {
                uuid
            },
            data: {
                hashedPassword: password_hash
            }
        })
    }

    async updateTwoFactor(uuid: string, twoFactorAuthDto: TwoFactorAuthDto) {
        return this.prisma.user.update({
            where: {
                uuid
            },
            data: {
                twoFactor: twoFactorAuthDto.on
            }
        })
    }

    async addCoins(coins: number, uuid: string) {
        return this.prisma.user.update({
            where: { uuid },
            data: {
                coins: {
                    increment: coins
                }
            }
        })
    }
}
