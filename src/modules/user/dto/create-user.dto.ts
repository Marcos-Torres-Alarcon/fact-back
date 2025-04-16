import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  MinLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../auth/enums/user-role.enum'

export class CreateUserDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  userId?: string

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty()
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
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({
    description: 'Departamento del usuario',
    example: 'Ventas',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string

  @ApiProperty({
    description: 'Cargo del usuario',
    example: 'Gerente',
    required: false,
  })
  @IsString()
  @IsOptional()
  position?: string

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Usuario con acceso especial',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    description: 'Permisos del usuario',
    example: ['permission1', 'permission2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]

  @ApiProperty({
    description: 'ID del usuario que crea este usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  createdBy?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  companyName?: string

  @IsOptional()
  @IsString()
  companyId?: string
}
