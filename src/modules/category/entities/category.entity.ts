import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export interface CategoryDocument extends Document {
  name: string
  key: string
  description?: string
  isActive: boolean
  companyId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface GetCategoryDocument extends CategoryDocument {
  _id: string
  companyId: Types.ObjectId
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  key: string

  @Prop()
  description?: string

  @Prop({ default: true })
  isActive: boolean

  @Prop({ required: true, type: Types.ObjectId, ref: 'Company' })
  companyId: Types.ObjectId
}

export const CategorySchema = SchemaFactory.createForClass(Category)

CategorySchema.index({ key: 1, companyId: 1 }, { unique: true })
