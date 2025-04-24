import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common'
import { InvoiceService } from './invoice.service'
import { CreateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Invoice } from './entities/invoice.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'
import { FileInterceptor } from '@nestjs/platform-express'

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name)

  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('token-sunat')
  getToken() {
    return this.invoiceService.generateTokenSunat()
  }

  @Post('validate-from-image')
  @UseInterceptors(
    FileInterceptor('invoiceImage', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/xml',
          'text/xml',
        ]
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true)
        } else {
          callback(new Error('Tipo de archivo no soportado'), false)
        }
      },
    })
  )
  async validateInvoice(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Received file: ${file?.originalname}, size: ${file?.size}`)

    if (!file || !file.buffer) {
      this.logger.error('No file uploaded or file buffer is missing')
      throw new HttpException(
        'No se recibió ningún archivo o el archivo está corrupto.',
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      const result = await this.invoiceService.validateInvoiceFromImage(
        file.buffer,
        file.mimetype
      )
      this.logger.log(
        `Validation result for ${file.originalname}: ${JSON.stringify(result)}`
      )
      return result
    } catch (error) {
      this.logger.error(
        `Error processing file ${file.originalname}: ${error.message}`,
        error.stack
      )
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Error procesando el archivo o validando la factura.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Factura creada exitosamente',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de factura inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente o proyecto no encontrado',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto)
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.PROVIDER,
    UserRole.USER,
    UserRole.COMPANY,
    UserRole.MANAGER,
    UserRole.TREASURY
  )
  @ApiOperation({ summary: 'Obtener todas las facturas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas obtenida exitosamente',
    type: [Invoice],
  })
  findAll() {
    return this.invoiceService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Factura encontrada exitosamente',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id)
  }

  @Get('client/:client')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener facturas por cliente' })
  @ApiParam({ name: 'client', description: 'ID del cliente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas del cliente obtenida exitosamente',
    type: [Invoice],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  findByClient(@Param('client') clientId: string) {
    return this.invoiceService.findByClient(clientId)
  }

  @Get('project/:project')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener facturas por proyecto' })
  @ApiParam({ name: 'project', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas del proyecto obtenida exitosamente',
    type: [Invoice],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto no encontrado',
  })
  findByProject(@Param('project') projectId: string) {
    return this.invoiceService.findByProject(projectId)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Factura actualizada exitosamente',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de actualización inválidos',
  })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto)
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar el estado de una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la factura actualizado exitosamente',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Estado de factura inválido',
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus
  ): Promise<Invoice> {
    return this.invoiceService.updateStatus(id, status)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Eliminar una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Factura eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id)
  }
}
