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
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { Roles } from '../../decorators/roles.decorator'
import { UserRole } from '../../shared/enums/role.enum'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RolesGuard } from '../../guards/roles.guard'
import { IRequest } from '../../shared/interfaces/request.interface'

@ApiTags('Proveedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('providers')
export class ProvidersController {
  private readonly logger = new Logger(ProvidersController.name)

  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @Req() req: IRequest
  ) {
    this.logger.debug(
      `Creando proveedor - Usuario: ${JSON.stringify({
        _id: req.user._id,
        role: req.user.role,
        companyId: req.user.companyId,
      })}`
    )

    if (req.user.role === UserRole.COMPANY) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario COMPANY no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }
      createProviderDto.companyId = req.user.companyId
      this.logger.debug(
        `Asignando companyId del usuario COMPANY: ${createProviderDto.companyId}`
      )
    } else if (!createProviderDto.companyId) {
      this.logger.warn('El ID de la compañía es requerido')
      throw new ForbiddenException('El ID de la compañía es requerido')
    }

    this.logger.debug(
      `Datos del proveedor a crear: ${JSON.stringify(createProviderDto)}`
    )
    return this.providersService.create(createProviderDto)
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.COMPANY,
    UserRole.PROVIDER,
    UserRole.ACCOUNTING,
    UserRole.TREASURY
  )
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  async findAll(@Req() req: IRequest) {
    this.logger.debug(`findAll - User role: ${req.user.role}`)
    this.logger.debug(`findAll - User companyId: ${req.user.companyId}`)
    this.logger.debug(`findAll - User data: ${JSON.stringify(req.user)}`)

    if (
      req.user.role === UserRole.COMPANY ||
      req.user.role === UserRole.ACCOUNTING ||
      req.user.role === UserRole.TREASURY
    ) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }

      this.logger.debug(
        `findAll - Finding providers for company: ${req.user.companyId}`
      )
      const providers = await this.providersService.findByCompanyId(
        req.user.companyId
      )
      this.logger.debug(
        `findAll - Found providers: ${JSON.stringify(providers)}`
      )
      return providers
    }
    if (req.user.role === UserRole.PROVIDER) {
      return this.providersService.findById(req.user._id)
    }
    return this.providersService.findAll()
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Obtener proveedores por compañía' })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Req() req: IRequest
  ) {
    this.logger.debug(`findByCompany - Company ID: ${companyId}`)
    this.logger.debug(`findByCompany - User role: ${req.user.role}`)
    this.logger.debug(`findByCompany - User companyId: ${req.user.companyId}`)

    // Si el usuario es COMPANY, usar su propio ID como companyId
    if (req.user.role === UserRole.COMPANY) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario COMPANY no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }
      companyId = req.user.companyId
      this.logger.debug(
        `findByCompany - Usando companyId del usuario: ${companyId}`
      )
    }

    const providers = await this.providersService.findByCompanyId(companyId)
    this.logger.debug(
      `findByCompany - Found providers: ${JSON.stringify(providers)}`
    )
    return providers
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  async findOne(@Param('id') id: string, @Req() req: IRequest) {
    this.logger.debug(`findOne - Provider ID: ${id}`)
    this.logger.debug(`findOne - User role: ${req.user.role}`)
    this.logger.debug(`findOne - User companyId: ${req.user.companyId}`)

    const provider = await this.providersService.findById(id)
    if (!provider) {
      this.logger.warn(`Proveedor no encontrado: ${id}`)
      throw new ForbiddenException('Proveedor no encontrado')
    }

    if (req.user.role === UserRole.COMPANY) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario COMPANY no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }
      if (provider.companyId !== req.user.companyId) {
        this.logger.warn(
          'El usuario COMPANY intentó acceder a un proveedor de otra compañía'
        )
        throw new ForbiddenException(
          'No tienes permisos para ver este proveedor'
        )
      }
    } else if (
      req.user.role === UserRole.PROVIDER &&
      provider._id !== req.user._id
    ) {
      this.logger.warn('El usuario PROVIDER intentó acceder a otro proveedor')
      throw new ForbiddenException('No tienes permisos para ver este proveedor')
    }

    return provider
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @Req() req: IRequest
  ) {
    this.logger.debug(`update - Provider ID: ${id}`)
    this.logger.debug(`update - User role: ${req.user.role}`)
    this.logger.debug(`update - User companyId: ${req.user.companyId}`)

    const provider = await this.providersService.findById(id)
    if (!provider) {
      this.logger.warn(`Proveedor no encontrado: ${id}`)
      throw new ForbiddenException('Proveedor no encontrado')
    }

    if (req.user.role === UserRole.COMPANY) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario COMPANY no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }
      if (provider.companyId !== req.user.companyId) {
        this.logger.warn(
          'El usuario COMPANY intentó actualizar un proveedor de otra compañía'
        )
        throw new ForbiddenException(
          'No tienes permisos para actualizar este proveedor'
        )
      }
    }

    return this.providersService.update(id, updateProviderDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  async remove(@Param('id') id: string, @Req() req: IRequest) {
    this.logger.debug(`remove - Provider ID: ${id}`)
    this.logger.debug(`remove - User role: ${req.user.role}`)
    this.logger.debug(`remove - User companyId: ${req.user.companyId}`)

    const provider = await this.providersService.findById(id)
    if (!provider) {
      this.logger.warn(`Proveedor no encontrado: ${id}`)
      throw new ForbiddenException('Proveedor no encontrado')
    }

    if (req.user.role === UserRole.COMPANY) {
      if (!req.user.companyId) {
        this.logger.warn('El usuario COMPANY no tiene companyId asignado')
        throw new ForbiddenException('No tienes una compañía asignada')
      }
      if (provider.companyId !== req.user.companyId) {
        this.logger.warn(
          'El usuario COMPANY intentó eliminar un proveedor de otra compañía'
        )
        throw new ForbiddenException(
          'No tienes permisos para eliminar este proveedor'
        )
      }
    }

    return this.providersService.remove(id)
  }
}
