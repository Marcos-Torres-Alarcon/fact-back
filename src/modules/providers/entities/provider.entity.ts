import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { CommonStatus } from '../../../shared/enums/status.enum'
import { UserRole } from '../../../shared/enums/role.enum'

export type ProviderDocument = Provider & Document

@Schema({ timestamps: true })
export class Provider extends Document {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop()
  phone: string

  @Prop()
  address: string

  @Prop({ required: true, unique: true })
  taxId: string

  @Prop({ type: [String], default: [] })
  products: string[]

  @Prop({ type: String, enum: CommonStatus, default: CommonStatus.PENDING })
  status: CommonStatus

  @Prop({ type: String, enum: UserRole, default: UserRole.PROVIDER })
  role: UserRole

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: 'ObjectId', ref: 'Company', required: true })
  companyId: string
}

export const ProviderSchema = SchemaFactory.createForClass(Provider)
