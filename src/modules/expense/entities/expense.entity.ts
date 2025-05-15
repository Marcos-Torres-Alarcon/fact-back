import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type ExpenseStatus = 'pending' | 'approved' | 'rejected'

export interface ExpenseDocument extends Document {
  proyect: string
  projectName?: string
  total: number
  description: string
  category: string
  file: string
  data: string
  status?: ExpenseStatus
  statusDate?: Date
  approvedBy?: string
  rejectedBy?: string
  rejectionReason?: string
}

export interface GetExpenseDocument extends ExpenseDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Expense {
  @ApiProperty({
    description: 'ID del proyecto',
    example: '6543210abcdef',
  })
  @Prop({ required: true })
  proyect: string

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Proyecto A',
    required: false,
  })
  @Prop()
  projectName: string

  @ApiProperty({
    description: 'Total de la factura',
    example: '1000',
    required: false,
  })
  @Prop()
  total: number

  @ApiProperty({
    description: 'Descripción de la factura',
    example: 'Factura 1',
  })
  @Prop()
  description: string

  @ApiProperty({
    description: 'Categoría de la factura',
    example: 'Transporte',
  })
  @Prop({ required: true })
  category: string

  @ApiProperty({
    description: 'URL del archivo',
    example: 'https://www.empresacliente.com',
  })
  @Prop({ required: true })
  file: string

  @ApiProperty({
    description: 'Datos de la factura',
    example: 'Datos de la factura',
  })
  @Prop()
  data: string

  @ApiProperty({
    description: 'Estado de la factura',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  @Prop({ default: 'pending' })
  status: ExpenseStatus

  @ApiProperty({
    description: 'Fecha de cambio de estado',
    required: false,
  })
  @Prop()
  statusDate: Date

  @ApiProperty({
    description: 'ID del usuario que aprobó la factura',
    required: false,
  })
  @Prop()
  approvedBy: string

  @ApiProperty({
    description: 'ID del usuario que rechazó la factura',
    required: false,
  })
  @Prop()
  rejectedBy: string

  @ApiProperty({
    description: 'Motivo del rechazo',
    required: false,
  })
  @Prop()
  rejectionReason: string

  @ApiProperty({
    description: 'ID del usuario que creó la factura',
    required: false,
  })
  @Prop()
  createdBy: string
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense)
