import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Provider } from '../../providers/entities/provider.entity'
import { UserRole } from '../../users/enums/user-role.enum'

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

@Schema({ timestamps: true })
export class PurchaseOrderItem {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, type: Number })
  quantity: number

  @Prop({ required: true, type: Number })
  unitPrice: number

  @Prop({ required: true, type: Number })
  total: number
}

@Schema({ timestamps: true })
export class PurchaseOrder extends Document {
  @ApiProperty({ description: 'Número de orden' })
  @Prop({ required: true, unique: true })
  orderNumber: string

  @ApiProperty({ description: 'ID de la compañía que crea la orden' })
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  company: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'ID del proveedor' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Provider', required: true })
  provider: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'ID del proyecto' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  project: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'Detalles de los productos' })
  @Prop({ type: [PurchaseOrderItem], required: true })
  items: PurchaseOrderItem[]

  @ApiProperty({ description: 'Total de la orden' })
  @Prop({ required: true, type: Number })
  totalAmount: number

  @ApiProperty({ description: 'Estado de la orden' })
  @Prop({ type: String, enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING })
  status: PurchaseOrderStatus

  @ApiProperty({ description: 'Notas o comentarios' })
  @Prop({ type: String })
  rejectionReason?: string

  @ApiProperty({ description: 'Usuario que creó la orden' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'Usuario que validó la orden' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  validatedBy?: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'Usuario que rechazó la orden' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  rejectedBy?: MongooseSchema.Types.ObjectId

  @ApiProperty({ description: 'Fecha de validación' })
  @Prop()
  validatedAt?: Date

  @ApiProperty({ description: 'Fecha de rechazo' })
  @Prop()
  rejectedAt?: Date
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder)
