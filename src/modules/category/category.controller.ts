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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Get(':companyId')
  findAll(@Param('companyId') companyId: string) {
    return this.categoryService.findAll(companyId)
  }

  @Get(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.categoryService.findOne(id, companyId)
  }

  @Get('key/:key/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findByKey(@Param('key') key: string, @Param('companyId') companyId: string) {
    return this.categoryService.findByKey(key, companyId)
  }

  @Patch(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  remove(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.categoryService.remove(id, companyId)
  }
}
