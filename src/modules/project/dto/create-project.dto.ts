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
import { ApiProperty } from '@nestjs/swagger'

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
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Construcción de Edificio Residencial',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Descripción detallada del proyecto',
    example: 'Proyecto de construcción de un edificio residencial de 10 pisos',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'ID de la compañía asociada al proyecto',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string

  @ApiProperty({
    description: 'ID del proveedor asignado al proyecto',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  providerId?: string

  @ApiProperty({
    description: 'Estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.PENDING,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus

  @ApiProperty({
    description: 'Estado del trabajo',
    enum: WorkStatus,
    example: WorkStatus.PENDING,
  })
  @IsEnum(WorkStatus)
  @IsOptional()
  workStatus?: WorkStatus

  @ApiProperty({
    description: 'Fecha de inicio del proyecto',
    example: '2024-04-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date

  @ApiProperty({
    description: 'Fecha de finalización estimada del proyecto',
    example: '2025-03-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date

  @ApiProperty({
    description: 'Presupuesto total del proyecto',
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  budget: number

  @ApiProperty({
    description: 'Notas adicionales sobre el proyecto',
    example: 'Proyecto con prioridad alta',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({
    description: 'Estado de actividad del proyecto',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true

  @ApiProperty({
    description: 'Fecha de inicio del trabajo',
    example: '2024-04-01T00:00:00.000Z',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  workStartDate?: Date

  @ApiProperty({
    description: 'Fecha de finalización del trabajo',
    example: '2024-05-01T00:00:00.000Z',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  workEndDate?: Date

  @ApiProperty({
    description: 'Notas sobre el trabajo realizado',
    example: 'Se completó la fase inicial del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  workNotes?: string

  @ApiProperty({
    description: 'Archivos adjuntos del trabajo',
    example: ['url1', 'url2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workAttachments?: string[]
}

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.IN_PROGRESS,
  })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus
}

export class UpdateWorkStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del trabajo',
    enum: WorkStatus,
    example: WorkStatus.COMPLETED,
  })
  @IsEnum(WorkStatus)
  @IsNotEmpty()
  workStatus: WorkStatus

  @ApiProperty({
    description: 'Notas sobre el trabajo',
    example: 'Se completó la fase inicial',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string
}

export class ApproveWorkDto {
  @ApiProperty({
    description: 'Notas de aprobación',
    example: 'Trabajo aprobado satisfactoriamente',
  })
  @IsString()
  @IsNotEmpty()
  notes: string
}
