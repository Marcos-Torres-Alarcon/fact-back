import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsMongoId,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class JobItemDto {
  @IsString()
  description: string

  @IsNumber()
  quantity: number

  @IsNumber()
  unitPrice: number

  @IsNumber()
  @IsOptional()
  discount?: number

  @IsNumber()
  @IsOptional()
  tax?: number
}

export class CreateJobDto {
  @IsMongoId()
  projectId: string

  @IsString()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus

  @IsEnum(JobPriority)
  @IsOptional()
  priority?: JobPriority

  @IsDate()
  @IsOptional()
  startDate?: Date

  @IsDate()
  @IsOptional()
  endDate?: Date

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobItemDto)
  @IsOptional()
  items?: JobItemDto[]

  @IsNumber()
  @IsOptional()
  budget?: number

  @IsString()
  @IsOptional()
  assignedTo?: string

  @IsString()
  @IsOptional()
  notes?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
