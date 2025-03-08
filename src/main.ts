import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app/app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())

    app.enableCors({
        origin: ['*'],
        methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    })

    // Настройка Swagger
    const config = new DocumentBuilder().setTitle('API Documentation').setDescription('Документация для API').setVersion('1.0').build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)

    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
