import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../auth/enums/user-role.enum'

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@ejemplo.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'contraseña123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string

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
}
