import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { ProjectStatus } from '../dto/create-project.dto'

export interface ProjectDocument extends Document {
  name: string
  description: string
  clientId: Types.ObjectId
  companyId: Types.ObjectId
  providerId?: Types.ObjectId
  status: ProjectStatus
  startDate: Date
  endDate: Date
  budget: number
  notes?: string
  isActive: boolean
  workStatus?: string
  workStartDate?: Date
  workEndDate?: Date
  workNotes?: string
  workAttachments?: string[]
  workApproved?: boolean
  workApprovedBy?: Types.ObjectId
  workApprovedDate?: Date
  invoiceId?: Types.ObjectId
  invoiceStatus?: string
  paymentStatus?: string
  paymentDate?: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface GetProjectDocument extends ProjectDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Project {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Construcción de Edificio Residencial',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Descripción detallada del proyecto',
    example: 'Proyecto de construcción de un edificio residencial de 10 pisos',
  })
  @Prop({ required: true })
  description: string

  @ApiProperty({
    description: 'ID del cliente asociado al proyecto',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId

  @ApiProperty({
    description: 'ID de la compañía asociada al proyecto',
    example: '664f0e2b2f4b2c0012a12345',
  })
  @Prop({ required: true })
  companyId: string

  @ApiProperty({
    description: 'ID del proveedor asignado al proyecto',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @Prop({ ref: 'Provider' })
  providerId: Types.ObjectId

  @ApiProperty({
    description: 'Estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.PENDING,
  })
  @Prop({ required: true, enum: ProjectStatus, default: ProjectStatus.PENDING })
  status: ProjectStatus

  @ApiProperty({
    description: 'Fecha de inicio del proyecto',
    example: '2024-04-01T00:00:00.000Z',
  })
  @Prop({ required: true })
  startDate: Date

  @ApiProperty({
    description: 'Fecha de finalización estimada del proyecto',
    example: '2025-03-31T00:00:00.000Z',
  })
  @Prop({ required: true })
  endDate: Date

  @ApiProperty({
    description: 'Presupuesto total del proyecto',
    example: 1000000,
  })
  @Prop({ required: true })
  budget: number

  @ApiProperty({
    description: 'Notas adicionales sobre el proyecto',
    example: 'Proyecto con prioridad alta',
    required: false,
  })
  @Prop()
  notes: string

  @ApiProperty({
    description: 'Estado de actividad del proyecto',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({
    description: 'Estado del trabajo',
    example: 'EN_PROGRESO',
    required: false,
  })
  @Prop()
  workStatus: string

  @ApiProperty({
    description: 'Fecha de inicio del trabajo',
    example: '2024-04-01T00:00:00.000Z',
    required: false,
  })
  @Prop()
  workStartDate?: Date

  @ApiProperty({
    description: 'Fecha de finalización del trabajo',
    example: '2024-05-01T00:00:00.000Z',
    required: false,
  })
  @Prop()
  workEndDate: Date

  @ApiProperty({
    description: 'Notas sobre el trabajo realizado',
    example: 'Se completó la fase inicial del proyecto',
    required: false,
  })
  @Prop()
  workNotes?: string

  @ApiProperty({
    description: 'Archivos adjuntos del trabajo',
    example: ['url1', 'url2'],
    required: false,
  })
  @Prop([String])
  workAttachments?: string[]

  @ApiProperty({
    description: 'Indica si el trabajo ha sido aprobado',
    example: true,
    required: false,
  })
  @Prop()
  workApproved: boolean

  @ApiProperty({
    description: 'Usuario que aprobó el trabajo',
    example: '507f1f77bcf86cd799439014',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  workApprovedBy: Types.ObjectId

  @ApiProperty({
    description: 'Fecha de aprobación del trabajo',
    example: '2024-05-02T00:00:00.000Z',
    required: false,
  })
  @Prop()
  workApprovedDate: Date

  @ApiProperty({
    description: 'ID de la factura asociada',
    example: '507f1f77bcf86cd799439015',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId

  @ApiProperty({
    description: 'Estado de la factura',
    example: 'PENDIENTE',
    required: false,
  })
  @Prop()
  invoiceStatus?: string

  @ApiProperty({
    description: 'Estado del pago',
    example: 'PENDIENTE',
    required: false,
  })
  @Prop()
  paymentStatus: string

  @ApiProperty({
    description: 'Fecha del pago',
    example: '2024-05-15T00:00:00.000Z',
    required: false,
  })
  @Prop()
  paymentDate: Date

  @ApiProperty({
    description: 'Fecha de completado del proyecto',
    example: '2024-12-15',
    required: false,
  })
  @Prop()
  completedAt: Date

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

export const ProjectSchema = SchemaFactory.createForClass(Project)
