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
  Request,
  Query,
} from '@nestjs/common'
import { ProjectService } from './project.service'
import {
  CreateProjectDto,
  UpdateProjectStatusDto,
  UpdateWorkStatusDto,
  ApproveWorkDto,
  ProjectStatus,
} from './dto/create-project.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../../shared/enums/role.enum'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { Project } from './entities/project.entity'

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'El proyecto ha sido creado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos en la solicitud.',
  })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectService.create(createProjectDto, req.user)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proyectos obtenida exitosamente.',
  })
  findAll(@Request() req) {
    return this.projectService.findAll(req.user)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proyecto encontrado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proyecto no encontrado.',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectService.findOne(id, req.user)
  }

  @Get('client/:client')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener proyectos por cliente' })
  @ApiParam({ name: 'client', description: 'ID del cliente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proyectos del cliente obtenida exitosamente',
    type: [Project],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  findByClient(@Param('client') clientId: string) {
    return this.projectService.findByClient(clientId)
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener proyectos por ID de compañía' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proyectos de la compañía obtenida exitosamente',
    type: [Project],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Compañía no encontrada',
  })
  findByCompany(@Param('companyId') companyId: string) {
    return this.projectService.findByCompany(companyId)
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener proyectos por estado' })
  @ApiParam({ name: 'status', description: 'Estado del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proyectos por estado obtenida exitosamente',
    type: [Project],
  })
  findByStatus(@Param('status') status: ProjectStatus): Promise<Project[]> {
    return this.projectService.findByStatus(status)
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.PROVIDER, UserRole.USER)
  @ApiOperation({ summary: 'Obtener proyectos por ID de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de proyectos del usuario obtenida exitosamente',
    type: [Project],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  findByUser(@Param('userId') userId: string) {
    return this.projectService.findByUser(userId)
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  @ApiOperation({ summary: 'Actualizar el estado de un proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del proyecto actualizado exitosamente.',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @Request() req
  ) {
    return this.projectService.updateStatus(id, updateStatusDto, req.user)
  }

  @Patch(':id/work-status')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Actualizar el estado del trabajo de un proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiBody({ type: UpdateWorkStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del trabajo actualizado exitosamente.',
  })
  updateWorkStatus(
    @Param('id') id: string,
    @Body() updateWorkDto: UpdateWorkStatusDto,
    @Request() req
  ) {
    return this.projectService.updateWorkStatus(id, updateWorkDto, req.user)
  }

  @Patch(':id/approve-work')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Aprobar el trabajo de un proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiBody({ type: ApproveWorkDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trabajo aprobado exitosamente.',
  })
  approveWork(
    @Param('id') id: string,
    @Body() approveWorkDto: ApproveWorkDto,
    @Request() req
  ) {
    return this.projectService.approveWork(id, approveWorkDto, req.user)
  }

  @Patch(':id/assign-provider/:providerId')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Asignar un proveedor a un proyecto' })
  @ApiResponse({ status: 200, description: 'Proveedor asignado exitosamente' })
  assignProvider(
    @Param('id') id: string,
    @Param('providerId') providerId: string
  ): Promise<Project> {
    return this.projectService.assignProvider(id, providerId)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  @ApiOperation({ summary: 'Eliminar un proyecto' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proyecto eliminado exitosamente.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectService.remove(id, req.user)
  }
}
