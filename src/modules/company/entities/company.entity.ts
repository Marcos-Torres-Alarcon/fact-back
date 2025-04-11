import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type CompanyDocument = Company & Document

export interface GetCompanyDocument extends CompanyDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Company {
  @ApiProperty({
    description: 'Nombre de la compañía',
    example: 'Empresa ABC S.A. de C.V.',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Correo electrónico de la compañía',
    example: 'contacto@empresaabc.com',
  })
  @Prop({ required: true, unique: true })
  email: string

  @ApiProperty({
    description: 'RFC de la compañía',
    example: 'ABC123456ABC1',
  })
  @Prop({ required: true, unique: true })
  taxId: string

  @ApiProperty({
    description: 'Dirección de la compañía',
    example: 'Av. Reforma 123, Ciudad de México',
  })
  @Prop()
  address?: string

  @ApiProperty({
    description: 'Teléfono de la compañía',
    example: '+525512345678',
  })
  @Prop()
  phone?: string

  @ApiProperty({
    description: 'Lista de proveedores asociados a la compañía',
    example: ['5f9d329f5b584c44c8a4c799', '5f9d329f5b584c44c8a4c79a'],
    required: false,
  })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Provider' }] })
  providers?: string[]

  @ApiProperty({
    description: 'Lista de usuarios asociados a la compañía',
    example: ['5f9d329f5b584c44c8a4c79b', '5f9d329f5b584c44c8a4c79c'],
    required: false,
  })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  users?: string[]

  @ApiProperty({
    description: 'Estado de la compañía',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({
    description: 'Descripción de la compañía',
    example: 'Empresa dedicada al desarrollo de software',
  })
  @Prop({ required: true })
  description: string

  @ApiProperty({
    description: 'Sitio web de la compañía',
    example: 'https://www.empresaabc.com',
    required: false,
  })
  @Prop()
  website?: string

  @ApiProperty({
    description: 'Notas adicionales sobre la compañía',
    example: 'Compañía líder en el sector',
    required: false,
  })
  @Prop()
  notes?: string

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

export const CompanySchema = SchemaFactory.createForClass(Company)
