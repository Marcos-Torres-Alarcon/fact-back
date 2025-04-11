import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador del sistema con acceso total',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]

  @IsString()
  @IsOptional()
  notes?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
