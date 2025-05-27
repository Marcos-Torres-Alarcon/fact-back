import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class CreateProjectTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  companyId: string
}
