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
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
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

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({
    status: 201,
    description: 'La categoría fue creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Obtener todas las categorías de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  findAll(@Param('companyId') companyId: string) {
    return this.categoryService.findAll(companyId)
  }

  @Get(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener una categoría por ID y empresa' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.categoryService.findOne(id, companyId)
  }

  @Get('key/:key/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener una categoría por clave y empresa' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findByKey(@Param('key') key: string, @Param('companyId') companyId: string) {
    return this.categoryService.findByKey(key, companyId)
  }

  @Patch(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar una categoría por ID y empresa' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  update(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto, companyId)
  }

  @Delete(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar una categoría por ID y empresa' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  remove(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.categoryService.remove(id, companyId)
  }
}
