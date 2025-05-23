import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export interface CategoryDocument extends Document {
  name: string
  key: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetCategoryDocument extends CategoryDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Alimentación',
  })
  @Prop({ required: true })
  name: string

  @ApiProperty({
    description: 'Clave única de la categoría',
    example: 'alimentacion',
  })
  @Prop({ required: true, unique: true })
  key: string

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Categoría para gastos de alimentación',
    required: false,
  })
  @Prop()
  description?: string

  @ApiProperty({
    description: 'Indica si la categoría está activa',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({
    description: 'ID de la compañía',
    example: '664f0e2b2f4b2c0012a12345',
  })
  @Prop({ required: true })
  companyId: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)

CategorySchema.index({ key: 1, companyId: 1 }, { unique: true })
