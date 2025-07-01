import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export interface CompanyConfigDocument extends Document {
  companyId: Types.ObjectId
  name: string
  logo?: string
}

@Schema({ timestamps: true })
export class CompanyConfig {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  companyId: Types.ObjectId

  @Prop({ required: true, default: 'Mi Empresa' })
  name: string

  @Prop()
  logo?: string
}

export const CompanyConfigSchema = SchemaFactory.createForClass(CompanyConfig)
