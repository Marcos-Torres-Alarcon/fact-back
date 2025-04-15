import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator'
import { CommonStatus } from '../../../shared/enums/status.enum'
import { UserRole } from '../../../shared/enums/role.enum'

export class UpdateProviderDto {
  @ApiProperty({ description: 'Nombre del proveedor', required: false })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({ description: 'Apellido del proveedor', required: false })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({ description: 'Email del proveedor', required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ description: 'Contraseña del proveedor', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string

  @ApiProperty({ description: 'Teléfono del proveedor', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8,15}$/, {
    message:
      'El teléfono debe contener solo números y tener entre 8 y 15 dígitos',
  })
  phone?: string

  @ApiProperty({ description: 'Dirección del proveedor', required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ description: 'RUC/NIT del proveedor', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{11}$/, {
    message: 'El RUC/NIT debe contener exactamente 11 dígitos',
  })
  taxId?: string

  @ApiProperty({
    description: 'Productos del proveedor',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  products?: string[]

  @ApiProperty({
    description: 'Estado del proveedor',
    enum: CommonStatus,
    required: false,
  })
  @IsEnum(CommonStatus)
  @IsOptional()
  status?: CommonStatus

  @ApiProperty({
    description: 'Rol del proveedor',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({ description: 'Estado activo del proveedor', required: false })
  @IsOptional()
  isActive?: boolean
}
