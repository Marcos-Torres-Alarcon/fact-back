import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Alimentación',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description:
      'Clave única de la categoría (opcional, se genera automáticamente)',
    example: 'alimentacion',
    required: false,
  })
  @IsString()
  @IsOptional()
  key?: string

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Gastos relacionados con alimentación',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Indica si la categoría está activa',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    description: 'ID de la compañía',
    example: '664f0e2b2f4b2c0012a12345',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string
}
