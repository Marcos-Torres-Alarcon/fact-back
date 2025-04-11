import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre de la compañía',
    example: 'Empresa ABC S.A. de C.V.',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Descripción de la compañía',
    example: 'Empresa dedicada al desarrollo de software',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Correo electrónico de la compañía',
    example: 'contacto@empresaabc.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Teléfono de la compañía',
    example: '+525512345678',
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string

  @ApiProperty({
    description: 'Dirección de la compañía',
    example: 'Av. Reforma 123, Ciudad de México',
  })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({
    description: 'RFC de la compañía',
    example: 'ABC123456ABC1',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string

  @ApiProperty({
    description: 'Sitio web de la compañía',
    example: 'https://www.empresaabc.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string

  @ApiProperty({
    description: 'Notas adicionales sobre la compañía',
    example: 'Compañía líder en el sector',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado de la compañía',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    description: 'Contraseña para el usuario de la compañía',
    example: 'contraseña123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string

  @ApiProperty({
    description: 'Lista de contactos de la compañía',
    example: [
      {
        name: 'Juan Pérez',
        position: 'Gerente',
        email: 'juan.perez@empresaabc.com',
        phone: '+525587654321',
      },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  contacts?: Array<{
    name: string
    position: string
    email: string
    phone: string
  }>
}
