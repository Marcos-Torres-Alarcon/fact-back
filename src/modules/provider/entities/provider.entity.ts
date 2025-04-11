import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type ProviderDocument = Provider & Document

export interface GetProviderDocument extends ProviderDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Provider {
  @ApiProperty({
    description: 'Nombre de la empresa o proveedor',
    example: 'Empresa Constructora S.A.',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'contacto@empresaconstructora.com',
  })
  @Prop({ required: true, unique: true })
  email: string

  @ApiProperty({
    description: 'RFC de la empresa',
    example: 'ECS123456ABC',
  })
  @Prop({ required: true, unique: true })
  taxId: string

  @ApiProperty({
    description: 'Dirección de la empresa',
    example: 'Av. Principal 123, Col. Centro',
  })
  @Prop()
  address?: string

  @ApiProperty({
    description: 'Número de teléfono de contacto',
    example: '+52 55 1234 5678',
  })
  @Prop()
  phone?: string

  @ApiProperty({
    description: 'Sitio web de la empresa',
    example: 'https://www.empresaconstructora.com',
    required: false,
  })
  @Prop()
  website?: string

  @ApiProperty({
    description: 'Lista de productos o servicios que ofrece',
    example: ['Materiales de construcción', 'Herramientas', 'Equipos'],
  })
  @Prop({ type: [{ type: String }] })
  products?: string[]

  @ApiProperty({
    description: 'Notas adicionales sobre el proveedor',
    example: 'Proveedor preferido para materiales de construcción',
    required: false,
  })
  @Prop()
  notes?: string

  @ApiProperty({
    description: 'Estado del proveedor',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({
    description: 'ID de la compañía asociada',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string

  @ApiProperty({
    description: 'ID de los usuarios asociados',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    required: false,
  })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  users?: string[]

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

export const ProviderSchema = SchemaFactory.createForClass(Provider)
