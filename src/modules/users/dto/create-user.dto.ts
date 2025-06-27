import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsMongoId,
  MinLength,
  IsBoolean,
  ValidateIf,
  Matches,
} from 'class-validator'
import { UserRole } from '../../../shared/enums/role.enum'

export class CreateUserDto {
  @IsString()
  @IsOptional()
  userId?: string

  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  email: string

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole

  @ValidateIf(o => o.role === UserRole.COMPANY)
  @IsMongoId()
  @IsNotEmpty()
  companyId?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
