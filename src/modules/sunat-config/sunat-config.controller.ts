import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common'
import { SunatConfigService } from './sunat-config.service'
import { CreateSunatConfigDto } from './dto/create-sunat-config.dto'
import { UpdateSunatConfigDto } from './dto/update-sunat-config.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@Controller('sunat-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SunatConfigController {
  private readonly logger = new Logger(SunatConfigController.name)

  constructor(private readonly sunatConfigService: SunatConfigService) {}

  @Post()
  @Roles(UserRole.ADMIN2)
  async create(
    @Body() createSunatConfigDto: CreateSunatConfigDto,
    @Req() req: any
  ) {
    try {
      this.logger.log('Recibida solicitud para crear configuración SUNAT')

      const companyId = req.user.companyId
      const config = await this.sunatConfigService.create(
        createSunatConfigDto,
        companyId
      )

      this.logger.log('Configuración SUNAT creada exitosamente')
      return config
    } catch (error) {
      this.logger.error(
        `Error al crear configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al crear la configuración SUNAT',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get()
  @Roles(UserRole.ADMIN2, UserRole.COLABORADOR)
  async findOne(@Req() req: any) {
    try {
      this.logger.log('Recibida solicitud para obtener configuración SUNAT')

      const companyId = req.user.companyId
      const config = await this.sunatConfigService.findOne(companyId)

      this.logger.log('Configuración SUNAT obtenida exitosamente')
      return config
    } catch (error) {
      this.logger.error(
        `Error al obtener configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al obtener la configuración SUNAT',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Patch()
  @Roles(UserRole.ADMIN2)
  async update(
    @Body() updateSunatConfigDto: UpdateSunatConfigDto,
    @Req() req: any
  ) {
    try {
      this.logger.log('Recibida solicitud para actualizar configuración SUNAT')

      const companyId = req.user.companyId
      const config = await this.sunatConfigService.update(
        companyId,
        updateSunatConfigDto
      )

      this.logger.log('Configuración SUNAT actualizada exitosamente')
      return config
    } catch (error) {
      this.logger.error(
        `Error al actualizar configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al actualizar la configuración SUNAT',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Delete()
  @Roles(UserRole.ADMIN2)
  async remove(@Req() req: any) {
    try {
      this.logger.log('Recibida solicitud para eliminar configuración SUNAT')

      const companyId = req.user.companyId
      const config = await this.sunatConfigService.remove(companyId)

      this.logger.log('Configuración SUNAT eliminada exitosamente')
      return config
    } catch (error) {
      this.logger.error(
        `Error al eliminar configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al eliminar la configuración SUNAT',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  // Endpoint para obtener credenciales activas (sin exponer datos sensibles)
  @Get('credentials')
  @Roles(UserRole.ADMIN2, UserRole.COLABORADOR)
  async getCredentials(@Req() req: any) {
    try {
      this.logger.log('Recibida solicitud para obtener credenciales SUNAT')

      const companyId = req.user.companyId
      const credentials =
        await this.sunatConfigService.getActiveCredentials(companyId)

      this.logger.log('Credenciales SUNAT obtenidas exitosamente')
      return credentials
    } catch (error) {
      this.logger.error(
        `Error al obtener credenciales SUNAT: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al obtener las credenciales SUNAT',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
