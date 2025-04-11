import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { Project } from '../../project/entities/project.entity'
import { JobStatus, JobPriority } from '../dto/create-job.dto'
import { ApiProperty } from '@nestjs/swagger'

export interface JobItem {
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  tax?: number
}

export interface JobDocument extends Document {
  projectId: MongooseSchema.Types.ObjectId
  title: string
  description?: string
  status: JobStatus
  priority: JobPriority
  startDate?: Date
  endDate?: Date
  items?: JobItem[]
  budget?: number
  assignedTo?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  completedAt: Date
}

export interface GetJobDocument extends JobDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Job extends Document {
  @ApiProperty({
    description: 'Título del trabajo',
    example: 'Instalación de sistema eléctrico',
  })
  @Prop({ required: true })
  title: string

  @ApiProperty({
    description: 'Descripción del trabajo',
    example: 'Instalar sistema eléctrico completo en el edificio',
  })
  @Prop({ required: true })
  description: string

  @ApiProperty({
    description: 'Estado del trabajo',
    enum: JobStatus,
    example: JobStatus.PENDING,
  })
  @Prop({ type: String, enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus

  @ApiProperty({
    description: 'Prioridad del trabajo',
    enum: JobPriority,
    example: JobPriority.MEDIUM,
  })
  @Prop({ type: String, enum: JobPriority, default: JobPriority.MEDIUM })
  priority: JobPriority

  @ApiProperty({
    description: 'Fecha de inicio del trabajo',
    example: '2024-03-20',
  })
  @Prop()
  startDate: Date

  @ApiProperty({
    description: 'Fecha de finalización del trabajo',
    example: '2024-04-20',
  })
  @Prop()
  endDate: Date

  @ApiProperty({
    description: 'Fecha de completado del trabajo',
    example: '2024-04-15',
  })
  @Prop()
  completedAt: Date

  @ApiProperty({
    description: 'ID del proyecto al que pertenece el trabajo',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  project: MongooseSchema.Types.ObjectId

  @ApiProperty({
    description: 'ID del usuario asignado al trabajo',
    example: '507f1f77bcf86cd799439012',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedTo: MongooseSchema.Types.ObjectId

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Trabajo con prioridad alta',
  })
  @Prop()
  notes?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const JobSchema = SchemaFactory.createForClass(Job)
