import { Controller, Get, UploadedFile, UseInterceptors, BadRequestException, Patch, UseGuards } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { AvatarService } from './avatar.service'
import { ApiOperation, ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { Express } from 'express'
import { extname } from 'path'
import { JwtPayloadDto } from 'src/modules/auth/dto'
import { JwtPayload } from 'src/modules/auth/decorators/jwt-payload.decorator'
import { JwtAuthGuard } from 'src/modules/auth/guards/auth.guard'
import { ActiveGuard } from 'src/modules/auth/guards/active.guard'
import * as fs from 'fs'

@ApiTags('User/Avatar')
@Controller('avatar')
export class AvatarController {
    constructor(private readonly avatarService: AvatarService) {}

    @ApiSecurity('bearer')
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Загрузка аватара (файл)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл логотипа (изображение)'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Файл загружен' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './media/users/avatars',
                filename: (req: any, file, callback) => {
                    const jwtPayload = req.user
                    const filename = `avatar-${jwtPayload.uuid}${extname(file.originalname)}`
                    callback(null, filename)
                }
            }),
            fileFilter: (req, file, callback) => {
                const allowedTypes = ['image/png', 'image/jpeg']
                if (!allowedTypes.includes(file.mimetype)) {
                    return callback(new BadRequestException('Разрешены только PNG и JPG'), false)
                }
                callback(null, true)
            },
            limits: { fileSize: 5 * 1024 * 1024 }
        })
    )
    @Patch('')
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @JwtPayload() jwtPayload: JwtPayloadDto) {
        return this.avatarService.uploadAvatar(jwtPayload.uuid, file.filename)
    }

    @ApiSecurity('bearer')
    @UseGuards(JwtAuthGuard, ActiveGuard)
    @ApiOperation({ summary: 'Получение аватара' })
    @Get('')
    async getAvatar(@JwtPayload() jwtPayload: JwtPayloadDto) {
        const avatar = await this.avatarService.getAvatar(jwtPayload.uuid)
        const logoPath = `./media/users/avatars/${avatar}`
        const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath, { encoding: 'base64' }) : null

        return {
            logo: logoBase64 ? `data:image/png;base64,${logoBase64}` : null
        }
    }
}
