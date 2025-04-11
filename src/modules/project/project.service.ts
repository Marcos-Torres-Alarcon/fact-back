import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { CreateProjectDto, ProjectStatus, UpdateProjectStatusDto, UpdateWorkStatusDto, ApproveWorkDto, WorkStatus } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Project, ProjectDocument } from './entities/project.entity'
import { UserRole } from '../user/entities/user-role.entity'

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {}

  async create(createProjectDto: CreateProjectDto, user: any) {
    try {
      if (user.role === UserRole.COMPANY) {
        createProjectDto.companyId = user.companyId
      }

      const project = new this.projectModel(createProjectDto)
      return await project.save()
    } catch (error) {
      throw new BadRequestException('Error al crear el proyecto: ' + error.message)
    }
  }

  async findAll(user: any) {
    try {
      let query = {}
      
      if (user.role === UserRole.COMPANY) {
        query = { companyId: user.companyId }
      } else if (user.role === UserRole.USER) {
        query = { providerId: user.providerId }
      }

      return await this.projectModel.find(query)
        .populate('clientId', 'name email')
        .populate('companyId', 'name')
        .populate('providerId', 'name')
        .exec()
    } catch (error) {
      throw new BadRequestException('Error al obtener los proyectos: ' + error.message)
    }
  }

  async findOne(id: string, user: any) {
    try {
      const project = await this.projectModel.findById(id)
        .populate('clientId', 'name email')
        .populate('companyId', 'name')
        .populate('providerId', 'name')
        .exec()

      if (!project) {
        throw new NotFoundException('Proyecto no encontrado')
      }

      if (user.role === UserRole.COMPANY && project.companyId.toString() !== user.companyId.toString()) {
        throw new ForbiddenException('No tienes permiso para ver este proyecto')
      }

      if (user.role === UserRole.USER && project.providerId?.toString() !== user.providerId.toString()) {
        throw new ForbiddenException('No tienes permiso para ver este proyecto')
      }

      return project
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      throw new BadRequestException('Error al obtener el proyecto: ' + error.message)
    }
  }

  async findByClient(clientId: string): Promise<Project[]> {
    const projects = await this.projectModel
      .find({ clientId })
      .populate('clientId')
      .populate('companyId')
      .exec()
    if (!projects.length) {
      throw new NotFoundException(
        `No se encontraron proyectos para el cliente con ID ${clientId}`
      )
    }
    return projects
  }

  async findByCompany(companyId: string): Promise<Project[]> {
    const projects = await this.projectModel
      .find({ companyId })
      .populate('clientId')
      .populate('companyId')
      .exec()
    if (!projects.length) {
      throw new NotFoundException(
        `No se encontraron proyectos para la compañía con ID ${companyId}`
      )
    }
    return projects
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectModel
      .find({ status })
      .populate('clientId')
      .populate('companyId')
      .exec()
  }

  async findByAssignedUser(userId: string): Promise<Project[]> {
    return this.projectModel
      .find({ assignedUsers: userId })
      .populate('clientId')
      .populate('companyId')
      .exec()
  }

  async findByUser(userId: string): Promise<Project[]> {
    const projects = await this.projectModel
      .find({
        $or: [{ assignedTo: userId }, { teamMembers: userId }],
      })
      .populate('clientId')
      .populate('assignedTo')
      .populate('teamMembers')
      .exec()
    if (!projects.length) {
      throw new NotFoundException(
        `No se encontraron proyectos para el usuario con ID ${userId}`
      )
    }
    return projects
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .populate('clientId')
      .populate('companyId')
      .exec()

    if (!updatedProject) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`)
    }
    return updatedProject
  }

  async updateStatus(id: string, updateStatusDto: UpdateProjectStatusDto, user: any) {
    try {
      const project = await this.findOne(id, user)

      if (user.role === UserRole.COMPANY && project.companyId.toString() !== user.companyId.toString()) {
        throw new ForbiddenException('No tienes permiso para actualizar este proyecto')
      }

      project.status = updateStatusDto.status
      if (updateStatusDto.status === ProjectStatus.COMPLETED) {
        project.completedAt = new Date()
      }

      return await project.save()
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      throw new BadRequestException('Error al actualizar el estado del proyecto: ' + error.message)
    }
  }

  async updateWorkStatus(id: string, updateWorkDto: UpdateWorkStatusDto, user: any) {
    try {
      const project = await this.findOne(id, user)

      if (user.role === UserRole.USER && project.providerId?.toString() !== user.providerId.toString()) {
        throw new ForbiddenException('No tienes permiso para actualizar el trabajo de este proyecto')
      }

      project.workStatus = updateWorkDto.workStatus
      project.workNotes = updateWorkDto.workNotes || project.workNotes
      
      if (updateWorkDto.workAttachments?.length > 0) {
        project.workAttachments = updateWorkDto.workAttachments
      }

      if (updateWorkDto.workStatus === WorkStatus.IN_PROGRESS && !project.workStartDate) {
        project.workStartDate = new Date()
      }

      if (updateWorkDto.workStatus === WorkStatus.PENDING_REVIEW) {
        project.workEndDate = new Date()
      }

      return await project.save()
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      throw new BadRequestException('Error al actualizar el estado del trabajo: ' + error.message)
    }
  }

  async approveWork(id: string, approveWorkDto: ApproveWorkDto, user: any) {
    try {
      const project = await this.findOne(id, user)

      if (user.role === UserRole.COMPANY && project.companyId.toString() !== user.companyId.toString()) {
        throw new ForbiddenException('No tienes permiso para aprobar el trabajo de este proyecto')
      }

      if (project.workStatus !== WorkStatus.PENDING_REVIEW) {
        throw new BadRequestException('El trabajo debe estar en revisión para ser aprobado')
      }

      project.workStatus = WorkStatus.APPROVED
      project.workApproved = true
      project.workApprovedBy = user._id
      project.workApprovedDate = new Date()
      
      if (approveWorkDto.approvalNotes) {
        project.workNotes = project.workNotes 
          ? `${project.workNotes}\n\nNotas de aprobación: ${approveWorkDto.approvalNotes}`
          : `Notas de aprobación: ${approveWorkDto.approvalNotes}`
      }

      return await project.save()
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Error al aprobar el trabajo: ' + error.message)
    }
  }

  async assignProvider(id: string, providerId: string): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(
      id,
      { 
        providerId: new Types.ObjectId(providerId),
        status: ProjectStatus.IN_PROGRESS 
      },
      { new: true }
    );
  }

  async remove(id: string, user: any) {
    try {
      const project = await this.findOne(id, user)

      if (user.role === UserRole.COMPANY && project.companyId.toString() !== user.companyId.toString()) {
        throw new ForbiddenException('No tienes permiso para eliminar este proyecto')
      }

      await project.deleteOne()
      return { message: 'Proyecto eliminado correctamente' }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      throw new BadRequestException('Error al eliminar el proyecto: ' + error.message)
    }
  }

  async complete(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id)
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    project.status = ProjectStatus.COMPLETED
    project.completedAt = new Date()
    return project.save()
  }
}
