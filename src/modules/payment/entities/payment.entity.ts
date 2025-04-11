import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { PaymentStatus, PaymentMethod } from '../dto/create-payment.dto'

export interface PaymentDocument extends Document {
  invoiceId: MongooseSchema.Types.ObjectId
  amount: number
  paymentDate: Date
  paymentMethod: PaymentMethod
  status: PaymentStatus
  referenceNumber?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetPaymentDocument extends PaymentDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Payment {
  @ApiProperty({
    description: 'ID de la factura asociada al pago',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Invoice', required: true })
  invoiceId: MongooseSchema.Types.ObjectId

  @ApiProperty({
    description: 'Monto del pago',
    example: 5000,
  })
  @Prop({ required: true })
  amount: number

  @ApiProperty({
    description: 'Fecha del pago',
    example: '2024-03-28T12:00:00.000Z',
  })
  @Prop({ required: true })
  paymentDate: Date

  @ApiProperty({
    description: 'Método de pago utilizado',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod

  @ApiProperty({
    description: 'Estado del pago',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @Prop({ type: String, enum: PaymentStatus, required: true })
  status: PaymentStatus

  @ApiProperty({
    description: 'Número de referencia del pago',
    example: 'REF123456',
    required: false,
  })
  @Prop()
  referenceNumber?: string

  @ApiProperty({
    description: 'Notas adicionales sobre el pago',
    example: 'Pago realizado por transferencia bancaria',
    required: false,
  })
  @Prop()
  notes?: string

  @ApiProperty({
    description: 'Estado del pago',
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

export const PaymentSchema = SchemaFactory.createForClass(Payment)
