import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsEnum,
  IsMongoId,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la factura asociada al pago',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  invoiceId: string

  @ApiProperty({
    description: 'Monto del pago',
    example: 1000.5,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty({
    description: 'Fecha del pago',
    example: '2024-03-28T12:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  paymentDate: Date

  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod

  @ApiProperty({
    description: 'Estado del pago',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus

  @ApiProperty({
    description: 'Número de referencia o transacción',
    example: 'TRX-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string

  @ApiProperty({
    description: 'Notas adicionales sobre el pago',
    example: 'Pago parcial de la factura',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado del pago',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
