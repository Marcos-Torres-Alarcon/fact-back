import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import {
  CreateProjectDto,
  ProjectStatus,
  UpdateProjectStatusDto,
  UpdateWorkStatusDto,
  ApproveWorkDto,
  WorkStatus,
} from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Project, ProjectDocument } from './entities/project.entity'
import { UserRole } from '../user/entities/user-role.entity'
import { IUser } from '../auth/interfaces/user.interface'

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    user: IUser
  ): Promise<Project> {
    const project = new this.projectModel({
      ...createProjectDto,
      createdBy: user._id,
      updatedBy: user._id,
      status: createProjectDto.status || 'PENDIENTE',
      workStatus: createProjectDto.workStatus || 'PENDIENTE',
    })
    return project.save()
  }

  async findAll(user: IUser): Promise<Project[]> {
    const query = user.role === 'ADMIN' ? {} : { companyId: user.companyId }
    return this.projectModel
      .find(query)
      .populate('providerId', 'firstName lastName')
      .exec()
  }

  async findOne(id: string, user: IUser): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('providerId', 'firstName lastName')
      .exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    return project
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
    updateProjectDto: Partial<CreateProjectDto>,
    user: IUser
  ): Promise<Project> {
    const project = await this.projectModel.findById(id).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }

    return this.projectModel
      .findByIdAndUpdate(
        id,
        { ...updateProjectDto, updatedBy: user._id },
        { new: true }
      )
      .exec()
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateProjectStatusDto,
    user: IUser
  ): Promise<Project> {
    const project = await this.projectModel.findById(id).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }

    return this.projectModel
      .findByIdAndUpdate(
        id,
        { status: updateStatusDto.status, updatedBy: user._id },
        { new: true }
      )
      .exec()
  }

  async updateWorkStatus(
    id: string,
    updateWorkStatusDto: UpdateWorkStatusDto,
    user: IUser
  ): Promise<Project> {
    const project = await this.projectModel.findById(id).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }

    return this.projectModel
      .findByIdAndUpdate(
        id,
        {
          workStatus: updateWorkStatusDto.workStatus,
          notes: updateWorkStatusDto.notes,
          updatedBy: user._id,
        },
        { new: true }
      )
      .exec()
  }

  async approveWork(
    id: string,
    approveWorkDto: ApproveWorkDto,
    user: IUser
  ): Promise<Project> {
    const project = await this.projectModel.findById(id).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }

    return this.projectModel
      .findByIdAndUpdate(
        id,
        {
          workStatus: 'COMPLETADO',
          notes: approveWorkDto.notes,
          updatedBy: user._id,
        },
        { new: true }
      )
      .exec()
  }

  async assignProvider(id: string, providerId: string): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(
      id,
      {
        providerId: new Types.ObjectId(providerId),
        status: ProjectStatus.IN_PROGRESS,
      },
      { new: true }
    )
  }

  async remove(id: string, user: IUser): Promise<void> {
    const project = await this.projectModel.findById(id).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    if (
      user.role !== 'ADMIN' &&
      project.companyId.toString() !== user.companyId.toString()
    ) {
      throw new NotFoundException('Proyecto no encontrado')
    }

    await this.projectModel.findByIdAndDelete(id).exec()
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
