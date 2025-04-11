import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export interface ClientDocument extends Document {
  name: string
  businessName?: string
  taxId: string
  address: string
  email: string
  phone: string
  website?: string
  projects: string[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetClientDocument extends ClientDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Client {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Razón social de la empresa',
    example: 'Empresa Cliente S.A.',
    required: false,
  })
  @Prop()
  businessName?: string

  @ApiProperty({
    description: 'RFC del cliente',
    example: 'RFC123456ABC',
  })
  @Prop({ required: true })
  taxId: string

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Av. Principal 123, Col. Centro',
  })
  @Prop({ required: true })
  address: string

  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan.perez@empresa.com',
  })
  @Prop({ required: true })
  email: string

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+52 55 1234 5678',
  })
  @Prop({ required: true })
  phone: string

  @ApiProperty({
    description: 'Sitio web del cliente',
    example: 'https://www.empresacliente.com',
    required: false,
  })
  @Prop()
  website?: string

  @ApiProperty({
    description: 'Lista de proyectos asociados al cliente',
    example: ['507f1f77bcf86cd799439011'],
  })
  @Prop([String])
  projects: string[]

  @ApiProperty({
    description: 'Notas adicionales sobre el cliente',
    example: 'Cliente preferido para proyectos residenciales',
    required: false,
  })
  @Prop()
  notes?: string

  @ApiProperty({
    description: 'Estado del cliente',
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

export const ClientSchema = SchemaFactory.createForClass(Client)
