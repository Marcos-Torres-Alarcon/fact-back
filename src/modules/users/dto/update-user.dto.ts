import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsEnum, IsOptional, IsMongoId } from 'class-validator'
import { UserRole } from '../enums/user-role.enum'

export class UpdateUserDto {
  @ApiProperty({ description: 'Nombre del usuario', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: 'Email del usuario', required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ description: 'Contraseña del usuario', required: false })
  @IsString()
  @IsOptional()
  password?: string

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({ description: 'ID de la compañía', required: false })
  @IsMongoId()
  @IsOptional()
  companyId?: string
} 