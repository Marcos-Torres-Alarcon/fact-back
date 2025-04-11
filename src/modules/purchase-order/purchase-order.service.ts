import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity'
import { UserRole } from '../users/enums/user-role.enum'
import { ProvidersService } from '../providers/providers.service'
import { v4 as uuidv4 } from 'uuid'
import { RequestUser, PurchaseOrderDocument, PurchaseOrderWithProvider } from './interfaces/purchase-order.interface'

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrder.name)
    private purchaseOrderModel: Model<PurchaseOrder>,
    private readonly providersService: ProvidersService
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, user: RequestUser): Promise<PurchaseOrderDocument> {
    // Verificar que el proveedor existe
    const provider = await this.providersService.findOne(createPurchaseOrderDto.provider)
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${createPurchaseOrderDto.provider} no encontrado`)
    }

    // Verificar permisos
    if (user.role === UserRole.COMPANY) {
      if (provider.companyId.toString() !== user.companyId.toString()) {
        throw new BadRequestException('No puedes crear órdenes de compra para proveedores de otras compañías')
      }
    }

    const purchaseOrder = new this.purchaseOrderModel(createPurchaseOrderDto)
    return purchaseOrder.save()
  }

  async findAll(user: RequestUser): Promise<PurchaseOrderWithProvider[]> {
    let query = this.purchaseOrderModel.find()

    if (user.role === UserRole.COMPANY) {
      query = query.find({ 'provider.companyId': user.companyId })
    } else if (user.role === UserRole.PROVIDER) {
      query = query.find({ provider: user.providerId })
    }

    const result = await query.populate('provider').exec()
    return result as unknown as PurchaseOrderWithProvider[]
  }

  async findOne(id: string, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (user.role === UserRole.ADMIN) {
      return purchaseOrder
    }

    if (user.role === UserRole.COMPANY && purchaseOrder.provider.companyId === user.companyId) {
      return purchaseOrder
    }

    if (user.role === UserRole.PROVIDER && purchaseOrder.provider._id === user.providerId) {
      return purchaseOrder
    }

    throw new BadRequestException('No tienes permisos para ver esta orden de compra')
  }

  async findByProvider(providerId: string, user: RequestUser): Promise<PurchaseOrderWithProvider[]> {
    let query = this.purchaseOrderModel.find({ provider: providerId })

    if (user.role === UserRole.COMPANY) {
      query = query.find({ 'provider.companyId': user.companyId })
    } else if (user.role === UserRole.PROVIDER && providerId !== user.providerId) {
      throw new BadRequestException('No tienes permisos para ver las órdenes de compra de este proveedor')
    }

    const result = await query.populate('provider').exec()
    return result as unknown as PurchaseOrderWithProvider[]
  }

  async findByStatus(status: PurchaseOrderStatus, user: RequestUser): Promise<PurchaseOrderWithProvider[]> {
    let query = this.purchaseOrderModel.find({ status })

    if (user.role === UserRole.COMPANY) {
      query = query.find({ 'provider.companyId': user.companyId })
    } else if (user.role === UserRole.PROVIDER) {
      query = query.find({ provider: user.providerId })
    }

    const result = await query.populate('provider').exec()
    return result as unknown as PurchaseOrderWithProvider[]
  }

  async findByProject(projectId: string, user: RequestUser): Promise<PurchaseOrderWithProvider[]> {
    let query = this.purchaseOrderModel.find({ project: projectId })

    if (user.role === UserRole.COMPANY) {
      query = query.find({ 'provider.companyId': user.companyId })
    } else if (user.role === UserRole.PROVIDER) {
      query = query.find({ provider: user.providerId })
    }

    const result = await query.populate('provider').exec()
    return result as unknown as PurchaseOrderWithProvider[]
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (user.role === UserRole.ADMIN) {
      // El ADMIN puede actualizar cualquier orden
    } else if (user.role === UserRole.COMPANY && purchaseOrder.provider.companyId === user.companyId) {
      // El COMPANY solo puede actualizar órdenes de sus proveedores
      if (updatePurchaseOrderDto.provider && updatePurchaseOrderDto.provider !== purchaseOrder.provider._id) {
        throw new BadRequestException('No puedes cambiar el proveedor de la orden')
      }
    } else if (user.role === UserRole.PROVIDER && purchaseOrder.provider._id === user.providerId) {
      // El PROVIDER solo puede actualizar el estado de sus órdenes
      const allowedFields = ['status']
      Object.keys(updatePurchaseOrderDto).forEach(key => {
        if (!allowedFields.includes(key)) {
          throw new BadRequestException(`No tienes permisos para actualizar el campo ${key}`)
        }
      })
    } else {
      throw new BadRequestException('No tienes permisos para actualizar esta orden de compra')
    }

    const updatedResult = await this.purchaseOrderModel
      .findByIdAndUpdate(id, updatePurchaseOrderDto, { new: true })
      .populate('provider')
      .exec()

    return updatedResult as unknown as PurchaseOrderWithProvider
  }

  async updateStatus(id: string, status: PurchaseOrderStatus, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (user.role === UserRole.ADMIN) {
      // El ADMIN puede cambiar cualquier estado
    } else if (user.role === UserRole.COMPANY && purchaseOrder.provider.companyId === user.companyId) {
      // El COMPANY solo puede cambiar estados de sus órdenes
      if (![PurchaseOrderStatus.PENDING, PurchaseOrderStatus.CANCELLED].includes(status)) {
        throw new BadRequestException('No tienes permisos para establecer este estado')
      }
    } else if (user.role === UserRole.PROVIDER && purchaseOrder.provider._id === user.providerId) {
      // El PROVIDER solo puede cambiar estados de sus órdenes
      if (![PurchaseOrderStatus.IN_PROGRESS, PurchaseOrderStatus.COMPLETED].includes(status)) {
        throw new BadRequestException('No tienes permisos para establecer este estado')
      }
    } else {
      throw new BadRequestException('No tienes permisos para actualizar el estado de esta orden')
    }

    const updatedResult = await this.purchaseOrderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('provider')
      .exec()

    return updatedResult as unknown as PurchaseOrderWithProvider
  }

  async remove(id: string, user: RequestUser): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('No tienes permisos para eliminar órdenes de compra')
    }

    const result = await this.purchaseOrderModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }
  }

  async validate(id: string, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Solo el administrador puede validar órdenes de compra')
    }

    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new BadRequestException('Solo se pueden validar órdenes en estado pendiente')
    }

    const updatedResult = await this.purchaseOrderModel
      .findByIdAndUpdate(id, { status: PurchaseOrderStatus.VALIDATED }, { new: true })
      .populate('provider')
      .exec()

    return updatedResult as unknown as PurchaseOrderWithProvider
  }

  async reject(id: string, reason: string, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Solo el administrador puede rechazar órdenes de compra')
    }

    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new BadRequestException('Solo se pueden rechazar órdenes en estado pendiente')
    }

    const updatedResult = await this.purchaseOrderModel
      .findByIdAndUpdate(
        id,
        { status: PurchaseOrderStatus.REJECTED, rejectionReason: reason },
        { new: true }
      )
      .populate('provider')
      .exec()

    return updatedResult as unknown as PurchaseOrderWithProvider
  }

  async complete(id: string, user: RequestUser): Promise<PurchaseOrderWithProvider> {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Solo el administrador puede completar órdenes de compra')
    }

    const result = await this.purchaseOrderModel
      .findById(id)
      .populate('provider')
      .exec()

    if (!result) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`)
    }

    const purchaseOrder = result as unknown as PurchaseOrderWithProvider

    if (purchaseOrder.status !== PurchaseOrderStatus.VALIDATED) {
      throw new BadRequestException('Solo se pueden completar órdenes validadas')
    }

    const updatedResult = await this.purchaseOrderModel
      .findByIdAndUpdate(id, { status: PurchaseOrderStatus.COMPLETED }, { new: true })
      .populate('provider')
      .exec()

    return updatedResult as unknown as PurchaseOrderWithProvider
  }
}
