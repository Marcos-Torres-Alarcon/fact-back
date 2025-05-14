import { IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateExpenseDto {
  @ApiProperty({
    description: 'ID del proyecto asociado',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  proyect: string

  @ApiProperty({
    description: 'Clave de la categoría asociada',
    example: 'food',
  })
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({
    description: 'URL de la imagen de la factura',
    example: 'data:image/png;base64,...',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string

  @ApiProperty({
    description: 'Datos extraídos de la factura en formato JSON',
    example: '{"rucEmisor":"12345678901","tipoComprobante":"Factura"}',
    required: false,
  })
  @IsString()
  @IsOptional()
  data?: string

  @ApiProperty({
    description: 'Total de la factura',
    example: 100.5,
    required: false,
  })
  @IsOptional()
  total?: number
}
