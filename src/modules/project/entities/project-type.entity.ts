import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

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
  @ApiProperty({
    description: 'Nombre del tipo de proyecto',
    example: 'Construcción',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Descripción del tipo de proyecto',
    example: 'Proyectos relacionados con construcción y obras',
    required: false,
  })
  @Prop()
  description?: string

  @ApiProperty({
    description: 'Indica si el tipo de proyecto está activo',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean
}

export const ProjectTypeSchema = SchemaFactory.createForClass(ProjectType)
