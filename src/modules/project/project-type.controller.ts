import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { ProjectTypeService } from './project-type.service'
import { CreateProjectTypeDto } from './dto/create-project-type.dto'
import { UpdateProjectTypeDto } from './dto/update-project-type.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@ApiTags('project-types')
@Controller('project-types')
@ApiBearerAuth()
export class ProjectTypeController {
  constructor(private readonly projectTypeService: ProjectTypeService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo tipo de proyecto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de proyecto creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createProjectTypeDto: CreateProjectTypeDto) {
    return this.projectTypeService.create(createProjectTypeDto)
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Obtener todos los tipos de proyectos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de proyectos obtenida exitosamente',
  })
  findAll(@Param('companyId') companyId: string) {
    return this.projectTypeService.findAll(companyId)
  }

  @Get(':id/:companyId')
  @ApiOperation({ summary: 'Obtener un tipo de proyecto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proyecto encontrado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proyecto no encontrado' })
  findOne(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.projectTypeService.findOne(id, companyId)
  }

  @Patch(':id/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Actualizar un tipo de proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proyecto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proyecto no encontrado' })
  update(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() updateProjectTypeDto: UpdateProjectTypeDto
  ) {
    return this.projectTypeService.update(id, updateProjectTypeDto, companyId)
  }

  @Delete(':id/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Eliminar un tipo de proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de proyecto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tipo de proyecto no encontrado' })
  remove(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.projectTypeService.remove(id, companyId)
  }
}
