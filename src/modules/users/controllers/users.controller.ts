import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { UserRole } from '../enums/user-role.enum'
import { UpdateUserDto } from '../dto/update-user.dto'

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Recibida solicitud para crear usuario: ${JSON.stringify(createUserDto)}`);
      const user = await this.usersService.create(createUserDto);
      this.logger.log(`Usuario creado exitosamente: ${user._id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al crear el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll() {
    try {
      this.logger.log('Recibida solicitud para obtener todos los usuarios');
      const users = await this.usersService.findAll();
      this.logger.log(`Se encontraron ${users.length} usuarios`);
      return users;
    } catch (error) {
      this.logger.error(`Error al obtener usuarios: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al obtener los usuarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`Recibida solicitud para obtener usuario: ${id}`);
      const user = await this.usersService.findOne(id);
      this.logger.log(`Usuario encontrado: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al obtener usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al obtener el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Recibida solicitud para actualizar usuario: ${id}`);
      const user = await this.usersService.update(id, updateUserDto);
      this.logger.log(`Usuario actualizado exitosamente: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al actualizar el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async remove(@Param('id') id: string) {
    try {
      this.logger.log(`Recibida solicitud para eliminar usuario: ${id}`);
      await this.usersService.remove(id);
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al eliminar el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 