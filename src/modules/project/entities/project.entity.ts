import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
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
  @Prop({ required: true })
  name: string

  @Prop()
  description: string

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  clientId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId

  @Prop({ ref: 'Provider' })
  providerId: Types.ObjectId

  @Prop({ required: true, enum: ProjectStatus, default: ProjectStatus.PENDING })
  status: ProjectStatus

  @Prop()
  startDate: Date

  @Prop()
  endDate: Date

  @Prop()
  budget: number

  @Prop()
  notes: string

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  workStatus: string

  @Prop()
  workStartDate?: Date

  @Prop()
  workEndDate: Date

  @Prop()
  workNotes?: string

  @Prop([String])
  workAttachments?: string[]

  @Prop()
  workApproved: boolean

  @Prop({ type: Types.ObjectId, ref: 'User' })
  workApprovedBy: Types.ObjectId

  @Prop()
  workApprovedDate: Date

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId

  @Prop()
  invoiceStatus?: string

  @Prop()
  paymentStatus: string

  @Prop()
  paymentDate: Date

  @Prop()
  completedAt: Date

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
