import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ExpenseStatus } from '../entities/expense.entity'

export class ApprovalDto {
  @ApiProperty({
    description: 'Estado de la factura',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected'],
  })
  @IsEnum(['pending', 'approved', 'rejected'])
  @IsNotEmpty()
  status: ExpenseStatus

  @ApiProperty({
    description: 'ID del usuario que realiza la acción',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: 'Motivo del rechazo (requerido solo para rechazos)',
    example: 'La factura no cumple con los requisitos',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string
}
