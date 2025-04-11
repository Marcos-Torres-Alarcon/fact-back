import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsOptional, IsMongoId } from 'class-validator'

export class UpdateProviderDto {
  @ApiProperty({ description: 'Nombre del proveedor', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: 'Email del proveedor', required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ description: 'Teléfono del proveedor', required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: 'Dirección del proveedor', required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ description: 'Descripción del proveedor', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'ID de la compañía', required: false })
  @IsMongoId()
  @IsOptional()
  companyId?: string
} 