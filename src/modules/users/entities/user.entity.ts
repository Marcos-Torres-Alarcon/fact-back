import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from '../../../shared/enums/role.enum'
import { ApiProperty } from '@nestjs/swagger'

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
  @ApiProperty({ description: 'ID del usuario' })
  @Prop({ type: String, required: true })
  _id: string

  @ApiProperty({ description: 'Nombre del usuario' })
  @Prop({ required: true })
  firstName: string

  @ApiProperty({ description: 'Apellido del usuario' })
  @Prop({ required: true })
  lastName: string

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @Prop({
    required: true,
    unique: true,
    index: true,
    collation: { locale: 'en', strength: 1 },
  })
  email: string

  @ApiProperty({ description: 'Contraseña del usuario' })
  @Prop({ required: true })
  password: string

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole

  @ApiProperty({ description: 'ID de la compañía' })
  @Prop({ type: String, required: true })
  companyId: string

  @ApiProperty({ description: 'Estado del usuario' })
  @Prop({ default: true })
  isActive: boolean

  @ApiProperty({ description: 'Versión del documento' })
  @Prop({ type: Number, default: 0 })
  __v: number
}

export const UserSchema = SchemaFactory.createForClass(User)

// Tipo para la respuesta de la API
export type UserResponse = Omit<User, 'password'>
