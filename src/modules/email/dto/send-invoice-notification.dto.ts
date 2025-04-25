import { IsString, IsNotEmpty, IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SendInvoiceNotificationDto {
  @ApiProperty({
    description: 'Correo electrónico del destinatario',
    example: 'usuario@empresa.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Proveedor ABC',
  })
  @IsString()
  @IsNotEmpty()
  providerName: string

  @ApiProperty({
    description: 'Número de factura',
    example: 'F001-001',
  })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2025-04-25T05:30:32.840Z',
  })
  @IsString()
  @IsNotEmpty()
  date: string

  @ApiProperty({
    description: 'Tipo de factura',
    example: 'pdf',
  })
  @IsString()
  @IsNotEmpty()
  type: string
}
