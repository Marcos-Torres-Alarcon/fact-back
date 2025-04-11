import { ApiProperty } from '@nestjs/swagger'
import { JobStatus, JobPriority } from './create-job.dto'

export class JobDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty({ enum: JobStatus })
  status: JobStatus

  @ApiProperty({ enum: JobPriority })
  priority: JobPriority

  @ApiProperty()
  startDate: Date

  @ApiProperty()
  endDate: Date

  @ApiProperty()
  completedAt?: Date

  @ApiProperty()
  project: string

  @ApiProperty()
  assignedTo: string

  @ApiProperty()
  notes?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
} 