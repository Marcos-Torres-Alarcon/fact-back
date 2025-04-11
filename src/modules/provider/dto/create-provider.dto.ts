import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsArray,
  IsMongoId,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

class CreateProviderUserDto {
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
  @IsNotEmpty()
  password: string
}

export class CreateProviderDto {
  @ApiProperty({
    description: 'Nombre de la empresa o proveedor',
    example: 'Empresa Constructora S.A.',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Razón social de la empresa',
    example: 'Empresa Constructora Sociedad Anónima',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string

  @ApiProperty({
    description: 'RFC de la empresa',
    example: 'ECS123456ABC',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string

  @ApiProperty({
    description: 'Dirección de la empresa',
    example: 'Av. Principal 123, Col. Centro',
  })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'contacto@empresaconstructora.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Número de teléfono de contacto',
    example: '+52 55 1234 5678',
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string

  @ApiProperty({
    description: 'Sitio web de la empresa',
    example: 'https://www.empresaconstructora.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string

  @ApiProperty({
    description: 'Lista de productos o servicios que ofrece',
    example: ['Materiales de construcción', 'Herramientas', 'Equipos'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  products?: string[]

  @ApiProperty({
    description: 'Notas adicionales sobre el proveedor',
    example: 'Proveedor preferido para materiales de construcción',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado del proveedor',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    description: 'ID de la compañía asociada',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  companyId?: string

  @ApiProperty({
    description: 'Datos del usuario asociado al proveedor',
    type: CreateProviderUserDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProviderUserDto)
  user?: CreateProviderUserDto

  @IsString()
  password: string
}
