import { ApiProperty } from '@nestjs/swagger'
import { ProjectStatus } from './create-project.dto'

export class ProjectDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus

  @ApiProperty()
  startDate: Date

  @ApiProperty()
  endDate: Date

  @ApiProperty()
  completedAt?: Date

  @ApiProperty()
  client: string

  @ApiProperty()
  manager: string

  @ApiProperty()
  budget: number

  @ApiProperty()
  notes?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
} 