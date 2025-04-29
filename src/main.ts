import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Factory API')
    .setDescription('API para el sistema de gestión de fábrica')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('roles', 'Gestión de roles')
    .addTag('providers', 'Gestión de proveedores')
    .addTag('companies', 'Gestión de empresas')
    .addTag('projects', 'Gestión de proyectos')
    .addTag('payments', 'Gestión de pagos')
    .addTag('invoices', 'Gestión de facturas')
    .addTag('jobs', 'Gestión de trabajos')
    .addTag('purchase-orders', 'Gestión de órdenes de compra')
    .addTag('clients', 'Gestión de clientes')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: true,
      },
    })
  )

  // Configuración de CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Configuración del prefijo global de la API
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3015
  await app.listen(port)
  console.log(`Server is running on port ${port}`)
}
bootstrap()
