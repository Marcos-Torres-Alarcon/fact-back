import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsArray,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateClientDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Razón social de la empresa',
    example: 'Empresa Cliente S.A.',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessName?: string

  @ApiProperty({
    description: 'RFC del cliente o empresa',
    example: 'RFC123456ABC',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Av. Principal 123, Col. Centro',
  })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'juan.perez@empresa.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Número de teléfono de contacto',
    example: '+52 55 1234 5678',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string

  @ApiProperty({
    description: 'Sitio web de la empresa',
    example: 'https://www.empresacliente.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string

  @ApiProperty({
    description: 'Lista de proyectos asociados',
    example: ['Proyecto 1', 'Proyecto 2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  projects: string[]

  @ApiProperty({
    description: 'Notas adicionales sobre el cliente',
    example: 'Cliente preferido para proyectos de construcción',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado del cliente',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
