import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class CreateProjectTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de proyecto',
    example: 'Proyecto 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Descripción del tipo de proyecto',
    example: 'Descripción del proyecto 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'ID de la compañía',
    example: '664f0e2b2f4b2c0012a12345',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string
}
