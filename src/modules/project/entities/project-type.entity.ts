import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export interface ProjectTypeDocument extends Document {
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetProjectTypeDocument extends ProjectTypeDocument {
  _id: string
}

@Schema({ timestamps: true })
export class ProjectType {
  @Prop({ required: true })
  name: string

  @Prop()
  description?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ required: true })
  companyId: string
}

export const ProjectTypeSchema = SchemaFactory.createForClass(ProjectType)
