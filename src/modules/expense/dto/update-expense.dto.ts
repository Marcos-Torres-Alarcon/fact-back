import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator'
import { ExpenseStatus } from '../entities/expense.entity'

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  proyectId?: string

  @IsString()
  @IsOptional()
  categoryId?: string

  @IsString()
  @IsOptional()
  data?: string

  @IsNumber()
  @IsOptional()
  total?: number

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  fechaEmision?: string

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: ExpenseStatus

  @IsString()
  @IsOptional()
  companyId?: string

  @IsString()
  @IsOptional()
  rejectionReason?: string

  @IsString()
  @IsOptional()
  approvedBy?: string

  @IsString()
  @IsOptional()
  rejectedBy?: string

  @IsOptional()
  statusDate?: Date
}
