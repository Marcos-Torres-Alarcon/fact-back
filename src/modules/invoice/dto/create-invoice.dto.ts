import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsEnum,
  IsMongoId,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export enum InvoiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class InvoiceItemDto {
  @ApiProperty({
    description: 'Descripción del ítem',
    example: 'Servicio de consultoría',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Cantidad del ítem',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity: number

  @ApiProperty({
    description: 'Precio unitario del ítem',
    example: 1000.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number

  @ApiProperty({
    description: 'Subtotal del ítem',
    example: 1000.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  subtotal: number
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  clientId: string

  @ApiProperty({
    description: 'ID del proyecto',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  projectId: string

  @ApiProperty({
    description: 'Número de factura',
    example: 'INV-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string

  @ApiProperty({
    description: 'Fecha de emisión de la factura',
    example: '2024-03-28T12:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  issueDate: Date

  @ApiProperty({
    description: 'Fecha de vencimiento de la factura',
    example: '2024-04-28T12:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date

  @ApiProperty({
    description: 'Lista de ítems de la factura',
    type: [InvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsNotEmpty()
  items: InvoiceItemDto[]

  @ApiProperty({
    description: 'Subtotal de la factura',
    example: 1000.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  subtotal: number

  @ApiProperty({
    description: 'Tasa de impuesto',
    example: 0.16,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  taxRate: number

  @ApiProperty({
    description: 'Monto del impuesto',
    example: 160.08,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  taxAmount: number

  @ApiProperty({
    description: 'Total de la factura',
    example: 1160.58,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  total: number

  @ApiProperty({
    description: 'Estado de la factura',
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
  })
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus

  @ApiProperty({
    description: 'Notas adicionales sobre la factura',
    example: 'Factura por servicios de consultoría',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado de la factura',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
