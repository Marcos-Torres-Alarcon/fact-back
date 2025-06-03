import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator'
import { ExpenseStatus } from '../entities/expense.entity'

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  proyectId: string

  @IsString()
  @IsNotEmpty()
  categoryId: string

  @IsString()
  @IsNotEmpty()
  imageUrl: string

  @IsString()
  @IsOptional()
  data?: string

  @IsOptional()
  total?: number

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: ExpenseStatus

  @IsString()
  @IsOptional()
  userId?: string

  @IsString()
  @IsNotEmpty()
  companyId: string
}
