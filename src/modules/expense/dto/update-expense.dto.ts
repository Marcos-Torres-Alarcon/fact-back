import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator'
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
  fechaEmision?: string

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: ExpenseStatus

  @IsString()
  @IsOptional()
  companyId?: string
}
