import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Company } from '../../company/entities/company.entity'
import { UserRole } from '../../auth/enums/user-role.enum'
import { Provider } from '../../provider/entities/provider.entity'

export interface UserResponse {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  companyId?: string
  providerId?: string
  permissions?: string[]
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = User & Document

export interface GetUserDocument extends UserDocument {
  _id: string
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Prop({ type: String })
  userId?: string

  @Prop({ type: String })
  phone?: string

  @Prop({ type: String })
  department?: string

  @Prop({ type: String })
  position?: string

  @Prop({ type: String })
  notes?: string

  @Prop({ type: Boolean, default: true })
  isActive: boolean

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId?: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Provider' })
  providerId?: string

  @Prop({ type: [String], default: [] })
  permissions: string[]

  @Prop({ type: String })
  createdBy?: string

  @Prop()
  lastLogin?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
