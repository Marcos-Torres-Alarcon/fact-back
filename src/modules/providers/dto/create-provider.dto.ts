import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsMongoId,
  IsArray,
  MinLength,
  Matches,
  IsEnum,
  IsBoolean,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { CommonStatus } from '../../../shared/enums/status.enum'
import { UserRole } from '../../../shared/enums/role.enum'

export class CreateProviderDto {
  @ApiProperty({ description: 'Nombre del proveedor' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: 'Apellido del proveedor' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ description: 'Email del proveedor' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'Contraseña del proveedor' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty({ description: 'Teléfono del proveedor' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{8,15}$/, {
    message:
      'El teléfono debe contener solo números y tener entre 8 y 15 dígitos',
  })
  phone: string

  @ApiProperty({ description: 'Dirección del proveedor' })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ description: 'RUC/NIT del proveedor' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, {
    message: 'El RUC/NIT debe contener exactamente 11 dígitos',
  })
  taxId: string

  @ApiProperty({
    description: 'Productos del proveedor (separados por comas)',
    type: [String],
    required: false,
    default: [],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim())
    }
    return value || []
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  products: string[] = []

  @ApiProperty({
    description: 'Estado del proveedor',
    enum: CommonStatus,
    default: CommonStatus.PENDING,
  })
  @Transform(({ value }) => {
    if (value === 'PENDING') return CommonStatus.PENDING
    if (value === 'ACTIVE') return CommonStatus.ACTIVE
    if (value === 'INACTIVE') return CommonStatus.INACTIVE
    if (value === 'COMPLETED') return CommonStatus.COMPLETED
    if (value === 'CANCELLED') return CommonStatus.CANCELLED
    return value
  })
  @IsEnum(CommonStatus)
  @IsOptional()
  status: CommonStatus = CommonStatus.PENDING

  @ApiProperty({
    description: 'Rol del proveedor',
    enum: UserRole,
    default: UserRole.PROVIDER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole = UserRole.PROVIDER

  @ApiProperty({ description: 'ID de la compañía' })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string

  @ApiProperty({ description: 'Activo del proveedor' })
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true
}
