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
import { Project } from './entities/project.entity'
import { UpdateProjectDto } from './dto/update-project.dto'

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectService.create(createProjectDto, req.user)
  }

  @Get(':companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.COMPANY,
    UserRole.PROVIDER,
    UserRole.COLABORADOR
  )
  findAll(@Param('companyId') companyId: string) {
    return this.projectService.findAll(companyId)
  }

  @Get(':id/:companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.COMPANY,
    UserRole.PROVIDER,
    UserRole.COLABORADOR
  )
  findOne(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.projectService.findOne(id, companyId)
  }

  @Get('client/:client/:companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.PROVIDER,
    UserRole.USER,
    UserRole.COLABORADOR
  )
  findByClient(
    @Param('client') clientId: string,
    @Param('companyId') companyId: string
  ) {
    return this.projectService.findByClient(clientId, companyId)
  }

  @Get('company/:companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.PROVIDER,
    UserRole.USER,
    UserRole.COLABORADOR
  )
  findByCompany(@Param('companyId') companyId: string) {
    return this.projectService.findByCompany(companyId)
  }

  @Get('status/:status/:companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.PROVIDER,
    UserRole.USER,
    UserRole.COLABORADOR
  )
  findByStatus(
    @Param('status') status: ProjectStatus,
    @Param('companyId') companyId: string
  ) {
    return this.projectService.findByStatus(status, companyId)
  }

  @Get('user/:userId/:companyId')
  @Roles(
    UserRole.ADMIN,
    UserRole.ADMIN2,
    UserRole.PROVIDER,
    UserRole.USER,
    UserRole.COLABORADOR
  )
  findByUser(
    @Param('userId') userId: string,
    @Param('companyId') companyId: string
  ) {
    return this.projectService.findByUser(userId, companyId)
  }

  @Patch(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  update(@Param('id') id: string, @Body() updateProyectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProyectDto)
  }

  @Patch(':id/status/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @Request() req
  ) {
    return this.projectService.updateStatus(id, updateStatusDto, req.user)
  }

  @Patch(':id/work-status/:companyId')
  @Roles(UserRole.PROVIDER)
  updateWorkStatus(
    @Param('id') id: string,
    @Body() updateWorkDto: UpdateWorkStatusDto,
    @Request() req
  ) {
    return this.projectService.updateWorkStatus(id, updateWorkDto, req.user)
  }

  @Patch(':id/approve-work/:companyId')
  @Roles(UserRole.COMPANY)
  approveWork(
    @Param('id') id: string,
    @Body() approveWorkDto: ApproveWorkDto,
    @Request() req
  ) {
    return this.projectService.approveWork(id, approveWorkDto, req.user)
  }

  @Patch(':id/assign-provider/:providerId/:companyId')
  @Roles(UserRole.COMPANY)
  assignProvider(
    @Param('id') id: string,
    @Param('providerId') providerId: string,
    @Param('companyId') companyId: string
  ): Promise<Project> {
    return this.projectService.assignProvider(id, providerId)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id)
  }
}
