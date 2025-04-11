import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { PurchaseOrderService } from './purchase-order.service'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../users/enums/user-role.enum'
import { Request as ExpressRequest } from 'express'
import { PurchaseOrderWithProvider, RequestUser } from './interfaces/purchase-order.interface'

@ApiTags('Órdenes de Compra')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Crear una nueva orden de compra' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Req() req: ExpressRequest) {
    return this.purchaseOrderService.create(createPurchaseOrderDto, req.user as RequestUser)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener todas las órdenes de compra' })
  @ApiResponse({ status: 200, description: 'Lista de órdenes' })
  findAll(@Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider[]> {
    return this.purchaseOrderService.findAll(req.user as RequestUser)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener una orden de compra por ID' })
  @ApiResponse({ status: 200, description: 'Orden encontrada' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  findOne(@Param('id') id: string, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider> {
    return this.purchaseOrderService.findOne(id, req.user as RequestUser)
  }

  @Get('provider/:providerId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener órdenes de compra por proveedor' })
  @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lista de órdenes de compra del proveedor obtenida exitosamente',
    type: [PurchaseOrder],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proveedor no encontrado',
  })
  findByProvider(@Param('providerId') providerId: string, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider[]> {
    return this.purchaseOrderService.findByProvider(providerId, req.user as RequestUser)
  }

  @Get('project/:projectId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener órdenes de compra por proyecto' })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de órdenes de compra por proyecto obtenida exitosamente',
    type: [PurchaseOrder],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto no encontrado',
  })
  findByProject(@Param('projectId') projectId: string, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider[]> {
    return this.purchaseOrderService.findByProject(projectId, req.user as RequestUser)
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener órdenes de compra por estado' })
  @ApiParam({ name: 'status', description: 'Estado de la orden', enum: PurchaseOrderStatus })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de órdenes de compra por estado obtenida exitosamente',
    type: [PurchaseOrder],
  })
  findByStatus(@Param('status') status: PurchaseOrderStatus, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider[]> {
    return this.purchaseOrderService.findByStatus(status, req.user as RequestUser)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar una orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orden de compra actualizada exitosamente',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de actualización inválidos',
  })
  update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @Req() req: ExpressRequest
  ): Promise<PurchaseOrderWithProvider> {
    return this.purchaseOrderService.update(id, updatePurchaseOrderDto, req.user as RequestUser)
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar el estado de una orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la orden de compra actualizado exitosamente',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Estado de orden de compra inválido',
  })
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: PurchaseOrderStatus,
    @Req() req: ExpressRequest
  ): Promise<PurchaseOrderWithProvider> {
    return this.purchaseOrderService.updateStatus(id, status, req.user as RequestUser)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Orden de compra eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: ExpressRequest) {
    return this.purchaseOrderService.remove(id, req.user as RequestUser)
  }

  @Patch(':id/validate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Validar una orden de compra' })
  @ApiResponse({ status: 200, description: 'Orden validada exitosamente' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  validate(@Param('id') id: string, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider> {
    return this.purchaseOrderService.validate(id, req.user as RequestUser)
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Rechazar una orden de compra' })
  @ApiResponse({ status: 200, description: 'Orden rechazada exitosamente' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: ExpressRequest
  ): Promise<PurchaseOrderWithProvider> {
    if (!reason) {
      throw new BadRequestException('Debe proporcionar una razón para el rechazo')
    }
    return this.purchaseOrderService.reject(id, reason, req.user as RequestUser)
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Completar una orden de compra' })
  @ApiResponse({ status: 200, description: 'Orden completada exitosamente' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  complete(@Param('id') id: string, @Req() req: ExpressRequest): Promise<PurchaseOrderWithProvider> {
    return this.purchaseOrderService.complete(id, req.user as RequestUser)
  }
}
