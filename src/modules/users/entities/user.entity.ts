import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from '../../../shared/enums/role.enum'

export type UserDocument = User &
  Document & {
    toObject(): any
    toJSON(): any
  }

@Schema({
  timestamps: true,
  id: true,
  _id: true,
  versionKey: '__v',
})
export class User {
  @Prop({ type: String, required: true })
  _id: string

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({
    required: true,
    unique: true,
    index: true,
    collation: { locale: 'en', strength: 1 },
  })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Number, default: 0 })
  __v: number
}

export const UserSchema = SchemaFactory.createForClass(User)

// Tipo para la respuesta de la API
export type UserResponse = Omit<User, 'password'>
