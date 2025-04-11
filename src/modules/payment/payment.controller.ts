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
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Payment } from './entities/payment.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Crear un nuevo pago' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pago creado exitosamente',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de pago inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener todos los pagos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pagos obtenida exitosamente',
    type: [Payment],
  })
  findAll() {
    return this.paymentService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pago encontrado exitosamente',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pago no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id)
  }

  @Get('invoice/:invoice')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener pagos por factura' })
  @ApiParam({ name: 'invoice', description: 'ID de la factura' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pagos de la factura obtenida exitosamente',
    type: [Payment],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  findByInvoice(@Param('invoice') invoice: string) {
    return this.paymentService.findByInvoice(invoice)
  }

  @Get('project/:project')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener pagos por proyecto' })
  @ApiParam({ name: 'project', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pagos del proyecto obtenida exitosamente',
    type: [Payment],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto no encontrado',
  })
  findByProject(@Param('project') project: string) {
    return this.paymentService.findByProject(project)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pago actualizado exitosamente',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pago no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de actualización inválidos',
  })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto)
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar el estado de un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del pago actualizado exitosamente',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pago no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Estado de pago inválido',
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus
  ): Promise<Payment> {
    return this.paymentService.updateStatus(id, status)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Eliminar un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Pago eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pago no encontrado',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id)
  }
}
