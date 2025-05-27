import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsEnum,
  IsMongoId,
  IsArray,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum ProjectStatus {
  PENDING = 'PENDIENTE',
  IN_PROGRESS = 'EN_PROGRESO',
  COMPLETED = 'COMPLETADO',
  CANCELLED = 'CANCELADO',
}

export enum WorkStatus {
  PENDING = 'PENDIENTE',
  COMPLETED = 'COMPLETADO',
  CANCELLED = 'CANCELADO',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateProjectDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description: string

  @IsMongoId()
  @IsNotEmpty()
  companyId: string

  @IsMongoId()
  @IsOptional()
  providerId?: string

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus

  @IsEnum(WorkStatus)
  @IsOptional()
  workStatus?: WorkStatus

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date

  @Type(() => Date)
  @IsDate() @IsOptional()
  endDate: Date

  @IsNumber()
  @Min(0) @IsOptional()
  budget: number

  @IsString()
  @IsOptional()
  notes?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  workStartDate?: Date

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  workEndDate?: Date

  @IsString()
  @IsOptional()
  workNotes?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workAttachments?: string[]
}

export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus
}

export class UpdateWorkStatusDto {
  @IsEnum(WorkStatus)
  @IsNotEmpty()
  workStatus: WorkStatus

  @IsString()
  @IsOptional()
  notes?: string
}

export class ApproveWorkDto {
  @IsString()
  @IsNotEmpty()
  notes: string
}
