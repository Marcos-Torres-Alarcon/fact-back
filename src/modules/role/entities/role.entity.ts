import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export enum RoleType {
  ADMIN = 'ADMIN',
  PURCHASING_MANAGER = 'PURCHASING_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  USER = 'USER',
}

export interface RoleDocument {
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetRoleDocument extends RoleDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Role {
  @ApiProperty({
    description: 'Nombre del rol',
    enum: RoleType,
    example: RoleType.ADMIN,
  })
  @Prop({ required: true, enum: RoleType })
  name: string

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador del sistema con acceso total',
  })
  @Prop({ required: true })
  description: string

  @ApiProperty({
    description: 'Lista de permisos del rol',
    example: ['create:user', 'read:user', 'update:user', 'delete:user'],
  })
  @Prop([String])
  permissions: string[]

  @ApiProperty({
    description: 'Estado del rol',
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

export const RoleSchema = SchemaFactory.createForClass(Role)
