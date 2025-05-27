import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator'
import { UserRole } from '../../../shared/enums/role.enum'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  password?: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @IsMongoId()
  @IsOptional()
  companyId?: string
}
