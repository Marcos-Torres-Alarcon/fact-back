import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { UserRole } from '../../../shared/enums/role.enum'
import { UpdateUserDto } from '../dto/update-user.dto'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.ADMIN2)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    try {
      this.logger.log(
        `Recibida solicitud para crear usuario: ${JSON.stringify(createUserDto)}`
      )
      this.logger.log(
        `Usuario autenticado: ${JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        })}`
      )

      if (createUserDto.role === UserRole.COMPANY && !createUserDto.companyId) {
        throw new HttpException(
          'El companyId es requerido para usuarios de tipo COMPANY',
          HttpStatus.BAD_REQUEST
        )
      }

      const companyId = req.user.companyId
      const user = await this.usersService.create(createUserDto, companyId)
      this.logger.log(`Usuario creado exitosamente: ${user._id}`)
      return user
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack)
      if (error.message.includes('email')) {
        throw new HttpException(
          'El correo electrónico ya está registrado',
          HttpStatus.BAD_REQUEST
        )
      }
      throw new HttpException(
        error.message || 'Error al crear el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.COMPANY,
    UserRole.PROVIDER,
    UserRole.ADMIN2,
    UserRole.COLABORADOR
  )
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(@Req() req: any) {
    try {
      this.logger.log('Recibida solicitud para obtener todos los usuarios')
      this.logger.log(
        `Usuario autenticado: ${JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        })}`
      )
      this.logger.log(
        `Roles permitidos: ADMIN, COMPANY, PROVIDER, ADMIN2, COLABORADOR`
      )

      if (
        ![
          UserRole.ADMIN,
          UserRole.COMPANY,
          UserRole.PROVIDER,
          UserRole.ADMIN2,
          UserRole.COLABORADOR,
        ].includes(req.user.role)
      ) {
        this.logger.error(`Rol no permitido: ${req.user.role}`)
        throw new HttpException(
          'No tienes permiso para realizar esta acción',
          HttpStatus.FORBIDDEN
        )
      }

      this.logger.log(`Headers de la solicitud: ${JSON.stringify(req.headers)}`)

      const companyId = req.user.companyId
      const users = await this.usersService.findAll(companyId)
      this.logger.log(`Se encontraron ${users.length} usuarios`)
      return users
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al obtener los usuarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    try {
      this.logger.log(`Recibida solicitud para obtener usuario: ${id}`)
      this.logger.log(
        `Usuario autenticado: ${JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        })}`
      )

      const companyId = req.user.companyId
      const user = await this.usersService.findOne(id, companyId)
      this.logger.log(`Usuario encontrado: ${id}`)
      return user
    } catch (error) {
      this.logger.error(
        `Error al obtener usuario: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al obtener el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any
  ) {
    try {
      this.logger.log(`Recibida solicitud para actualizar usuario: ${id}`)
      this.logger.log(
        `Usuario autenticado: ${JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        })}`
      )

      const companyId = req.user.companyId
      const user = await this.usersService.update(id, updateUserDto, companyId)
      this.logger.log(`Usuario actualizado exitosamente: ${id}`)
      return user
    } catch (error) {
      this.logger.error(
        `Error al actualizar usuario: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al actualizar el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COMPANY)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async remove(@Param('id') id: string, @Req() req: any) {
    try {
      this.logger.log(`Recibida solicitud para eliminar usuario: ${id}`)
      this.logger.log(
        `Usuario autenticado: ${JSON.stringify({
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        })}`
      )

      const companyId = req.user.companyId
      await this.usersService.remove(id, companyId)
      this.logger.log(`Usuario eliminado exitosamente: ${id}`)
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al eliminar el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
