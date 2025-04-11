import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Project } from '../../project/entities/project.entity'
import { InvoiceStatus } from '../dto/create-invoice.dto'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  tax?: number
}

export interface InvoiceDocument extends Document {
  clientId: MongooseSchema.Types.ObjectId
  projectId: MongooseSchema.Types.ObjectId
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid?: number
  balance?: number
  status: InvoiceStatus
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetInvoiceDocument extends InvoiceDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Invoice {
  @ApiProperty({
    description: 'ID del cliente asociado a la factura',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  clientId: MongooseSchema.Types.ObjectId

  @ApiProperty({
    description: 'ID del proyecto asociado a la factura',
    example: '507f1f77bcf86cd799439012',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: MongooseSchema.Types.ObjectId

  @ApiProperty({
    description: 'Número de factura',
    example: 'INV-2024-001',
  })
  @Prop({ required: true })
  invoiceNumber: string

  @ApiProperty({
    description: 'Fecha de emisión de la factura',
    example: '2024-03-28T12:00:00.000Z',
  })
  @Prop({ required: true })
  issueDate: Date

  @ApiProperty({
    description: 'Fecha de vencimiento de la factura',
    example: '2024-04-28T12:00:00.000Z',
  })
  @Prop({ required: true })
  dueDate: Date

  @ApiProperty({
    description: 'Items de la factura',
    example: [
      {
        description: 'Materiales de construcción',
        quantity: 100,
        unitPrice: 1000,
        discount: 0,
        tax: 16,
      },
    ],
  })
  @Prop([
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      discount: { type: Number },
      tax: { type: Number },
    },
  ])
  items: InvoiceItem[]

  @ApiProperty({
    description: 'Subtotal de la factura',
    example: 100000,
  })
  @Prop({ required: true })
  subtotal: number

  @ApiProperty({
    description: 'Tasa de impuesto aplicada',
    example: 16,
  })
  @Prop({ required: true })
  taxRate: number

  @ApiProperty({
    description: 'Monto del impuesto',
    example: 16000,
  })
  @Prop({ required: true })
  taxAmount: number

  @ApiProperty({
    description: 'Total de la factura',
    example: 116000,
  })
  @Prop({ required: true })
  total: number

  @ApiProperty({
    description: 'Monto pagado',
    example: 58000,
    required: false,
  })
  @Prop()
  amountPaid?: number

  @ApiProperty({
    description: 'Saldo pendiente',
    example: 58000,
    required: false,
  })
  @Prop()
  balance?: number

  @ApiProperty({
    description: 'Estado de la factura',
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
  })
  @Prop({ type: String, enum: InvoiceStatus, required: true })
  status: InvoiceStatus

  @ApiProperty({
    description: 'Notas adicionales sobre la factura',
    example: 'Factura con descuento por pronto pago',
    required: false,
  })
  @Prop()
  notes?: string

  @ApiProperty({
    description: 'Estado de la factura',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-03-28T12:00:00.000Z',
  })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-03-28T12:00:00.000Z',
  })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice)
