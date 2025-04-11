import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Req,
  HttpException,
  Logger,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
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
import { Request as ExpressRequest } from 'express'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: ExpressRequest): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para crear usuario: ${JSON.stringify(createUserDto)}`);
      const user = await this.userService.create(createUserDto);
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
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Obtener usuarios según permisos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(@Req() req: ExpressRequest): Promise<User[]> {
    try {
      this.logger.log('Recibida solicitud para obtener todos los usuarios');
      const users = await this.userService.findAll(req.user);
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
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id') id: string, @Req() req: ExpressRequest): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para obtener usuario: ${id}`);
      const user = await this.userService.findOne(id, req.user);
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

  @Get('email/:email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario por email' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByEmail(@Param('email') email: string): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para obtener usuario por email: ${email}`);
      const user = await this.userService.findByEmail(email);
      if (!user) {
        this.logger.warn(`Usuario no encontrado por email: ${email}`);
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`Usuario encontrado por email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al buscar usuario por email',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: ExpressRequest
  ): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para actualizar usuario: ${id}`);
      const user = await this.userService.update(id, updateUserDto, req.user);
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

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar el rol de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol de usuario actualizado exitosamente',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para actualizar rol de usuario: ${id}`);
      const user = await this.userService.updateRole(id, role);
      this.logger.log(`Rol de usuario actualizado exitosamente: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al actualizar rol de usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al actualizar el rol del usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar el estado de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Estado de usuario actualizado exitosamente',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<User> {
    try {
      this.logger.log(`Recibida solicitud para actualizar estado de usuario: ${id}`);
      const user = await this.userService.updateStatus(id, isActive);
      this.logger.log(`Estado de usuario actualizado exitosamente: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al actualizar estado de usuario: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error al actualizar el estado del usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(`Recibida solicitud para eliminar usuario: ${id}`);
      await this.userService.delete(id);
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
