import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../auth/enums/user-role.enum'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  companyName?: string

  @IsOptional()
  @IsString()
  companyId?: string
}
