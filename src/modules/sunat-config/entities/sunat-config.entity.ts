import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export interface SunatConfigDocument extends Document {
  companyId: Types.ObjectId
  clientId: string
  clientSecret: string
  isActive: boolean
}

@Schema({ timestamps: true })
export class SunatConfig {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  companyId: Types.ObjectId

  @Prop({ required: true })
  clientId: string

  @Prop({ required: true })
  clientSecret: string

  @Prop({ default: true })
  isActive: boolean
}

export const SunatConfigSchema = SchemaFactory.createForClass(SunatConfig)
