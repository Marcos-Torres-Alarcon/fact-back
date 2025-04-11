import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsMongoId } from 'class-validator'

export class CreateProviderDto {
  @ApiProperty({ description: 'Nombre del proveedor' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Email del proveedor' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'Teléfono del proveedor' })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: 'Dirección del proveedor' })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ description: 'Descripción del proveedor' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'ID de la compañía' })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string
} 