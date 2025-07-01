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
  HttpCode,
  Logger,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Types } from 'mongoose'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { UserRole } from '../../../shared/enums/role.enum'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.ADMIN2)
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

      // Generar userId automáticamente si no se proporciona
      if (!createUserDto.userId) {
        createUserDto.userId = new Types.ObjectId().toString()
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

  @Post('create-with-company')
  @HttpCode(HttpStatus.CREATED)
  async createWithCompany(
    @Body() createUserDto: CreateUserDto & { companyId: string }
  ) {
    try {
      this.logger.log(
        `Recibida solicitud para crear usuario con compañía específica: ${JSON.stringify(createUserDto)}`
      )

      if (!createUserDto.companyId) {
        throw new HttpException(
          'El companyId es requerido para este endpoint',
          HttpStatus.BAD_REQUEST
        )
      }

      if (createUserDto.role === UserRole.COMPANY && !createUserDto.companyId) {
        throw new HttpException(
          'El companyId es requerido para usuarios de tipo COMPANY',
          HttpStatus.BAD_REQUEST
        )
      }

      // Generar userId automáticamente si no se proporciona
      if (!createUserDto.userId) {
        createUserDto.userId = new Types.ObjectId().toString()
      }

      const { companyId, ...userData } = createUserDto
      const user = await this.usersService.create(userData, companyId)
      this.logger.log(
        `Usuario creado exitosamente con companyId ${companyId}: ${user._id}`
      )
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

      let companyId = req.user.companyId
      this.logger.log(`CompanyId del token JWT: ${companyId}`)
      this.logger.log(`Rol del usuario: ${req.user.role}`)

      if (!companyId) {
        this.logger.log('Token sin companyId, obteniendo de la base de datos')
        this.logger.log(
          `Datos completos del usuario del token: ${JSON.stringify(req.user)}`
        )

        try {
          const currentUser = await this.usersService.findByEmail(
            req.user.email
          )
          companyId = currentUser.companyId
          this.logger.log(
            `CompanyId obtenido de la base de datos por email: ${companyId}`
          )
        } catch (error) {
          this.logger.error(
            `Error al buscar usuario por email: ${error.message}`
          )
          throw new HttpException(
            'No se pudo obtener la información de la compañía del usuario',
            HttpStatus.INTERNAL_SERVER_ERROR
          )
        }
      }

      if (!companyId) {
        this.logger.warn('Usuario no tiene companyId asignado')
        throw new HttpException(
          'Usuario sin compañía asignada',
          HttpStatus.BAD_REQUEST
        )
      }

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
      const user = await this.usersService.findOne(id)
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

  // Endpoints para configuración de empresa
  @Get('config/:companyId')
  @Roles(UserRole.ADMIN2, UserRole.COLABORADOR)
  async getCompanyConfig(@Param('companyId') companyId: string) {
    try {
      this.logger.log(
        `Recibida solicitud para obtener configuración de empresa: ${companyId}`
      )
      const config = await this.usersService.getCompanyConfig(companyId)
      this.logger.log(
        `Configuración obtenida exitosamente para companyId: ${companyId}`
      )
      return config
    } catch (error) {
      this.logger.error(
        `Error al obtener configuración de empresa: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al obtener la configuración de empresa',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Patch('config/:companyId')
  @Roles(UserRole.ADMIN2)
  async updateCompanyConfig(
    @Param('companyId') companyId: string,
    @Body() config: { name?: string; logo?: string }
  ) {
    try {
      this.logger.log(
        `Recibida solicitud para actualizar configuración de empresa: ${companyId}`
      )
      const updatedConfig = await this.usersService.updateCompanyConfig(
        companyId,
        config
      )
      this.logger.log(
        `Configuración actualizada exitosamente para companyId: ${companyId}`
      )
      return updatedConfig
    } catch (error) {
      this.logger.error(
        `Error al actualizar configuración de empresa: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al actualizar la configuración de empresa',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('config/:companyId/logo')
  @Roles(UserRole.ADMIN2)
  @UseInterceptors(
    FileInterceptor('logo', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false)
        }
        cb(null, true)
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async uploadLogo(
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      this.logger.log(
        `Recibida solicitud para subir logo de empresa: ${companyId}`
      )

      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST)
      }

      // TODO: Implementar subida a AWS S3
      // Por ahora, simulamos una URL de S3
      const s3Url = `https://your-s3-bucket.s3.amazonaws.com/logos/${companyId}/${Date.now()}-${file.originalname}`

      const config = await this.usersService.updateCompanyConfig(companyId, {
        logo: s3Url,
      })
      this.logger.log(`Logo subido exitosamente para companyId: ${companyId}`)
      return config
    } catch (error) {
      this.logger.error(
        `Error al subir logo de empresa: ${error.message}`,
        error.stack
      )
      throw new HttpException(
        error.message || 'Error al subir el logo de empresa',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
