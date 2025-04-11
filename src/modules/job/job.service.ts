import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { CreateJobDto, JobStatus } from './dto/create-job.dto'
import { UpdateJobDto } from './dto/update-job.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Job } from './entities/job.entity'

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: Model<Job>
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    try {
      const createdJob = new this.jobModel({
        ...createJobDto,
        status: createJobDto.status || JobStatus.PENDING,
      })
      return await createdJob.save()
    } catch (error) {
      throw new HttpException(
        'Error al crear el trabajo',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findAll(): Promise<Job[]> {
    try {
      return await this.jobModel.find().populate('projectId').exec()
    } catch (error) {
      throw new HttpException(
        'Error al obtener los trabajos',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOne(id: string): Promise<Job> {
    try {
      const job = await this.jobModel.findById(id).populate('projectId').exec()
      if (!job) {
        throw new HttpException(
          `Trabajo con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        )
      }
      return job
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Error al obtener el trabajo',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findByProject(projectId: string): Promise<Job[]> {
    try {
      return await this.jobModel
        .find({ projectId })
        .populate('projectId')
        .exec()
    } catch (error) {
      throw new HttpException(
        'Error al obtener los trabajos del proyecto',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    try {
      return await this.jobModel.find({ status }).populate('projectId').exec()
    } catch (error) {
      throw new HttpException(
        'Error al obtener los trabajos por estado',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findByUser(userId: string): Promise<Job[]> {
    return this.jobModel.find({ assignedTo: userId }).exec()
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    try {
      const updatedJob = await this.jobModel
        .findByIdAndUpdate(id, updateJobDto, { new: true })
        .populate('projectId')
        .exec()

      if (!updatedJob) {
        throw new HttpException(
          `Trabajo con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        )
      }
      return updatedJob
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Error al actualizar el trabajo',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const job = await this.jobModel.findById(id)
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`)
    }

    const updateData: any = { status }
    
    if (status === JobStatus.COMPLETED) {
      updateData.completedAt = new Date()
    }

    return this.jobModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.jobModel.findByIdAndDelete(id).exec()
      if (!result) {
        throw new HttpException(
          `Trabajo con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Error al eliminar el trabajo',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async complete(id: string): Promise<Job> {
    const job = await this.jobModel.findById(id)
    if (!job) {
      throw new NotFoundException('Trabajo no encontrado')
    }
    job.status = JobStatus.COMPLETED
    job.completedAt = new Date()
    return job.save()
  }
}
