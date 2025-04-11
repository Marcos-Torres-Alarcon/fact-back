import { IsString, IsEmail, IsOptional, IsArray, IsBoolean } from 'class-validator'

export class UpdateProviderDto {
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  products?: string[]

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
