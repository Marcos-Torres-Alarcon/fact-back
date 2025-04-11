import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator'

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  taxId?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
