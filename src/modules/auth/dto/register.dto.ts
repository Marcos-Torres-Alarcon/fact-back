import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsMongoId,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../enums/user-role.enum'

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString()
  firstName: string

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString()
  lastName: string

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@ejemplo.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'contraseña123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+1234567890',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  role: UserRole = UserRole.USER

  @ApiProperty({
    description: 'ID de la compañía (si aplica)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyId?: string

  @ApiProperty({
    description: 'ID del proveedor (si aplica)',
    example: '507f1f77bcf86cd799439012',
    required: false,
  })
  @IsString()
  @IsOptional()
  providerId?: string

  @ApiProperty({
    description: 'Permisos del usuario',
    example: ['read', 'write'],
    required: false,
  })
  @IsOptional()
  permissions?: string[]
}
