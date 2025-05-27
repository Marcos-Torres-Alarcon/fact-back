import { ProjectStatus } from "../enums/project-status.enum"

export class ProjectDto {
  id: string

  name: string

  description: string

  status: ProjectStatus

  startDate: Date

  endDate: Date

  completedAt?: Date

  client: string

  manager: string

  budget: number

  notes?: string

  createdAt: Date

  updatedAt: Date
} 