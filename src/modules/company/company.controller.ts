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
import { CompanyService } from './company.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto)
  }

  @Get()
  findAll() {
    return this.companyService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id)
  }

  // Endpoints para configuración de empresa (compatibles con el frontend)
  @Get('config/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN2, UserRole.COLABORADOR)
  getCompanyConfig(@Param('companyId') companyId: string) {
    return this.companyService.getCompanyConfig(companyId)
  }

  @Patch('config/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN2)
  updateCompanyConfig(
    @Param('companyId') companyId: string,
    @Body() config: { name?: string; logo?: string }
  ) {
    return this.companyService.updateCompanyConfig(companyId, config)
  }
}
