import { ApiProperty } from '@nestjs/swagger'
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
} from 'class-validator'
import { UserRole, UserRoleDescription } from '../enums/user-role.enum'

export class CreateUserDto {
  @ApiProperty({ description: 'ID del usuario (opcional)' })
  @IsMongoId()
  @IsOptional()
  _id?: string

  @ApiProperty({ description: 'ID único del usuario' })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole

  @ApiProperty({
    description: 'ID de la compañía (requerido para rol COMPANY)',
  })
  @ValidateIf(o => o.role === UserRole.COMPANY)
  @IsMongoId()
  @IsNotEmpty()
  companyId?: string

  @ApiProperty({ description: 'Estado del usuario', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
