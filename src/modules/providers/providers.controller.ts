import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req
} from '@nestjs/common'
import { Roles } from '../../decorators/roles.decorator'
import { UserRole } from '../../shared/enums/role.enum'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RolesGuard } from '../../guards/roles.guard'
import { IRequest } from '../../shared/interfaces/request.interface'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('providers')
export class ProvidersController {

  constructor(private readonly providersService: ProvidersService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @Req() req: IRequest
  ) {
    const companyId = req.user.companyId
    return this.providersService.create(createProviderDto, companyId)
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.COMPANY,
    UserRole.PROVIDER,
    UserRole.ACCOUNTING,
    UserRole.TREASURY
  )
  async findAll(@Req() req: IRequest) {
    const companyId = req.user.companyId
    return this.providersService.findAll(companyId)
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  async findByCompany(
    @Param('companyId') companyId: string,
    @Req() req: IRequest
  ) {
    if (req.user.role === UserRole.COMPANY) {
      companyId = req.user.companyId
    }
    return this.providersService.findByCompanyId(companyId)
  }

  @Get(':id/:companyId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  async findOne(@Param('id') id: string, @Param('companyId') companyId: string, @Req() req: IRequest) {
    if (req.user.role === UserRole.COMPANY) {
      companyId = req.user.companyId
    }
    return this.providersService.findById(id, companyId)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @Req() req: IRequest
  ) {
    const companyId = req.user.companyId
    return this.providersService.update(id, updateProviderDto, companyId)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  async remove(@Param('id') id: string, @Req() req: IRequest) {
    const companyId = req.user.companyId
    return this.providersService.remove(id)
  }
}
