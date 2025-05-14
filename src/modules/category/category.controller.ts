import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({
    status: 201,
    description: 'La categoría fue creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  findAll() {
    return this.categoryService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id)
  }

  @Get('key/:key')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @ApiOperation({ summary: 'Obtener una categoría por clave' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findByKey(@Param('key') key: string) {
    return this.categoryService.findByKey(key)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Actualizar una categoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Eliminar una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id)
  }
}
