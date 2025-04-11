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
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ProviderService } from './provider.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'
import { Request } from 'express'

@ApiTags('providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  create(@Body() createProviderDto: CreateProviderDto, @Req() req: Request) {
    return this.providerService.create(createProviderDto, req.user['userId'])
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores' })
  findAll(@Req() req: Request) {
    return this.providerService.findAll(req.user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.providerService.findOne(id, req.user)
  }

  @Get('tax-id/:taxId')
  @ApiOperation({ summary: 'Buscar proveedores por NIT' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores encontrados' })
  findByTaxId(@Param('taxId') taxId: string, @Req() req: Request) {
    return this.providerService.findByTaxId(taxId, req.user)
  }

  @Get('project/:project')
  @ApiOperation({ summary: 'Buscar proveedores por proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores encontrados' })
  findByProject(@Param('project') project: string, @Req() req: Request) {
    return this.providerService.findByProject(project, req.user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @Req() req: Request
  ) {
    return this.providerService.update(id, updateProviderDto, req.user)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.providerService.remove(id, req.user)
  }
}
