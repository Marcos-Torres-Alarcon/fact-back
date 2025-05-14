import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  ProjectType,
  ProjectTypeDocument,
} from './entities/project-type.entity'
import { CreateProjectTypeDto } from './dto/create-project-type.dto'
import { UpdateProjectTypeDto } from './dto/update-project-type.dto'

@Injectable()
export class ProjectTypeService {
  private readonly logger = new Logger(ProjectTypeService.name)

  constructor(
    @InjectModel(ProjectType.name)
    private projectTypeModel: Model<ProjectTypeDocument>
  ) {}

  async create(
    createProjectTypeDto: CreateProjectTypeDto
  ): Promise<ProjectTypeDocument> {
    try {
      const newProjectType = new this.projectTypeModel(createProjectTypeDto)
      return await newProjectType.save()
    } catch (error) {
      this.logger.error(
        `Error al crear tipo de proyecto: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findAll(): Promise<ProjectTypeDocument[]> {
    try {
      return await this.projectTypeModel.find().exec()
    } catch (error) {
      this.logger.error(
        `Error al obtener tipos de proyectos: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findOne(id: string): Promise<ProjectTypeDocument> {
    try {
      const projectType = await this.projectTypeModel.findById(id).exec()
      if (!projectType) {
        throw new NotFoundException(
          `Tipo de proyecto con ID ${id} no encontrado`
        )
      }
      return projectType
    } catch (error) {
      this.logger.error(
        `Error al obtener tipo de proyecto: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async update(
    id: string,
    updateProjectTypeDto: UpdateProjectTypeDto
  ): Promise<ProjectTypeDocument> {
    try {
      const existingProjectType = await this.projectTypeModel
        .findById(id)
        .exec()
      if (!existingProjectType) {
        throw new NotFoundException(
          `Tipo de proyecto con ID ${id} no encontrado`
        )
      }

      const updatedProjectType = await this.projectTypeModel
        .findByIdAndUpdate(id, updateProjectTypeDto, { new: true })
        .exec()

      return updatedProjectType
    } catch (error) {
      this.logger.error(
        `Error al actualizar tipo de proyecto: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.projectTypeModel.findByIdAndDelete(id).exec()
      if (!result) {
        throw new NotFoundException(
          `Tipo de proyecto con ID ${id} no encontrado`
        )
      }
    } catch (error) {
      this.logger.error(
        `Error al eliminar tipo de proyecto: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
