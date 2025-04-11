import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { JobService } from './job.service'
import { CreateJobDto, JobStatus } from './dto/create-job.dto'
import { UpdateJobDto } from './dto/update-job.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Job } from './entities/job.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Crear un nuevo trabajo' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trabajo creado exitosamente',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de trabajo inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto o usuario no encontrado',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener todos los trabajos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de trabajos obtenida exitosamente',
    type: [Job],
  })
  findAll() {
    return this.jobService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener un trabajo por ID' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trabajo encontrado exitosamente',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajo no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id)
  }

  @Get('project/:projectId')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener trabajos por ID de proyecto' })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de trabajos del proyecto obtenida exitosamente',
    type: [Job],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto no encontrado',
  })
  findByProject(@Param('projectId') projectId: string) {
    return this.jobService.findByProject(projectId)
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener trabajos por ID de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de trabajos del usuario obtenida exitosamente',
    type: [Job],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  findByUser(@Param('userId') userId: string) {
    return this.jobService.findByUser(userId)
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener trabajos por estado' })
  @ApiParam({ name: 'status', description: 'Estado del trabajo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de trabajos por estado obtenida exitosamente',
    type: [Job],
  })
  findByStatus(@Param('status') status: JobStatus): Promise<Job[]> {
    return this.jobService.findByStatus(status)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar un trabajo' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trabajo actualizado exitosamente',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajo no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de actualización inválidos',
  })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto)
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar el estado de un trabajo' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del trabajo actualizado exitosamente',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajo no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Estado de trabajo inválido',
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus
  ): Promise<Job> {
    return this.jobService.updateStatus(id, status)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Eliminar un trabajo' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Trabajo eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajo no encontrado',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.jobService.remove(id)
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Marcar un trabajo como completado' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trabajo marcado como completado exitosamente',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Trabajo no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de actualización inválidos',
  })
  complete(@Param('id') id: string): Promise<Job> {
    return this.jobService.complete(id)
  }
}
