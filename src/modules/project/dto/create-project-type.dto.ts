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
}
