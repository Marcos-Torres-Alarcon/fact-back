import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common'
import { CompanyService } from './company.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva compañía' })
  @ApiResponse({ status: 201, description: 'Compañía creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto)
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las compañías' })
  @ApiResponse({ status: 200, description: 'Lista de compañías' })
  findAll(@Req() req: Request) {
    return this.companyService.findAll(req.user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una compañía por ID' })
  @ApiResponse({ status: 200, description: 'Compañía encontrada' })
  @ApiResponse({ status: 404, description: 'Compañía no encontrada' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.companyService.findOne(id, req.user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una compañía' })
  @ApiResponse({ status: 200, description: 'Compañía actualizada' })
  @ApiResponse({ status: 404, description: 'Compañía no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: Request
  ) {
    return this.companyService.update(id, updateCompanyDto, req.user)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una compañía' })
  @ApiResponse({ status: 200, description: 'Compañía eliminada' })
  @ApiResponse({ status: 404, description: 'Compañía no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.companyService.remove(id, req.user)
  }
}
