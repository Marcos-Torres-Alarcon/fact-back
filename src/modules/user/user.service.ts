import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt'
import { UserRole } from '../auth/enums/user-role.enum'
import { EmailService } from '../email/email.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(
        `Intentando crear usuario con email: ${createUserDto.email}`
      )

      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      })
      if (existingUser) {
        this.logger.warn(
          `Intento de crear usuario con email existente: ${createUserDto.email}`
        )
        throw new BadRequestException(
          'El correo electrónico ya está registrado'
        )
      }

      // Encriptar contraseña si se proporciona
      if (createUserDto.password) {
        this.logger.log('Encriptando contraseña del usuario')
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10)
      }

      // Crear usuario
      const user = new this.userModel(createUserDto)
      const savedUser = await user.save()
      this.logger.log(`Usuario creado exitosamente con ID: ${savedUser._id}`)
      return savedUser
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack)
      throw error
    }
  }

  async findAll(user: any): Promise<User[]> {
    try {
      this.logger.log('Obteniendo todos los usuarios')

      if (user.role === UserRole.ADMIN) {
        return await this.userModel.find().select('-password')
      }

      if (user.role === UserRole.COMPANY) {
        return await this.userModel
          .find({ companyId: user.companyId })
          .select('-password')
      }

      if (user.role === UserRole.PROVIDER) {
        return await this.userModel
          .find({ providerId: user.providerId })
          .select('-password')
      }

      return []
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findOne(id: string, user: any): Promise<User> {
    try {
      this.logger.log(`Buscando usuario con ID: ${id}`)

      const foundUser = await this.userModel.findById(id).select('-password')
      if (!foundUser) {
        this.logger.warn(`Usuario no encontrado con ID: ${id}`)
        throw new NotFoundException('Usuario no encontrado')
      }

      // Verificar permisos
      if (user.role === UserRole.ADMIN) {
        this.logger.log(`ADMIN: Acceso permitido al usuario ${id}`)
        return foundUser
      }

      if (user.role === UserRole.COMPANY) {
        this.logger.log(
          `COMPANY: Verificando permisos para ver usuario de la compañía ${user.companyId}`
        )
        if (foundUser.companyId.toString() !== user.companyId.toString()) {
          this.logger.warn(
            `COMPANY: Intento de ver usuario de otra compañía. User companyId: ${user.companyId}, Found user companyId: ${foundUser.companyId}`
          )
          throw new ForbiddenException(
            'No tiene permisos para ver este usuario'
          )
        }
        this.logger.log('COMPANY: Permiso concedido para ver usuario')
        return foundUser
      }

      if (
        user.role === UserRole.PROVIDER &&
        foundUser.providerId === user.providerId
      ) {
        this.logger.log(
          'PROVIDER: Permiso concedido para ver su propio usuario'
        )
        return foundUser
      }

      this.logger.warn(`Acceso denegado para el rol ${user.role}`)
      throw new ForbiddenException('No tiene permisos para ver este usuario')
    } catch (error) {
      this.logger.error(
        `Error al obtener usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Buscando usuario por email: ${email}`)
      const user = await this.userModel.findOne({ email }).select('-password')
      if (!user) {
        this.logger.warn(`Usuario no encontrado con email: ${email}`)
        throw new NotFoundException('Usuario no encontrado')
      }
      this.logger.log(`Usuario encontrado con email: ${email}`)
      return user
    } catch (error) {
      this.logger.error(
        `Error al buscar usuario por email: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: UserDocument
  ): Promise<UserDocument> {
    try {
      this.logger.log(`Actualizando usuario con ID: ${id}`)
      const user = await this.userModel.findById(id).exec()
      if (!user) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`)
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`)
      }

      // Verificar permisos para usuarios COMPANY
      if (currentUser?.role === UserRole.COMPANY) {
        if (user.companyId.toString() !== currentUser.companyId.toString()) {
          throw new ForbiddenException(
            'No tienes permisos para actualizar usuarios de otras compañías'
          )
        }
      }

      // Si se proporciona una contraseña, encriptarla
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
      }

      // Preservar solo el companyId
      const updateData = {
        ...updateUserDto,
        companyId: user.companyId,
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec()

      this.logger.log(`Usuario actualizado exitosamente: ${id}`)
      return updatedUser
    } catch (error) {
      this.logger.error(
        `Error al actualizar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    try {
      this.logger.log(`Actualizando rol del usuario ${id} a ${role}`)

      const user = await this.userModel.findById(id)
      if (!user) {
        this.logger.warn(`Usuario no encontrado para actualizar rol: ${id}`)
        throw new NotFoundException('Usuario no encontrado')
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { role }, { new: true })
        .select('-password')

      this.logger.log(`Rol de usuario actualizado exitosamente: ${id}`)
      return updatedUser
    } catch (error) {
      this.logger.error(
        `Error al actualizar rol de usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    try {
      this.logger.log(`Actualizando estado del usuario ${id} a ${isActive}`)

      const user = await this.userModel.findById(id)
      if (!user) {
        this.logger.warn(`Usuario no encontrado para actualizar estado: ${id}`)
        throw new NotFoundException('Usuario no encontrado')
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { isActive }, { new: true })
        .select('-password')

      this.logger.log(`Estado de usuario actualizado exitosamente: ${id}`)
      return updatedUser
    } catch (error) {
      this.logger.error(
        `Error al actualizar estado de usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async remove(id: string, user: any): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario: ${id}`)
      this.logger.debug(
        `Usuario que realiza la acción: ${JSON.stringify(user)}`
      )

      const foundUser = await this.userModel.findById(id)
      if (!foundUser) {
        this.logger.warn(`Usuario no encontrado con ID: ${id}`)
        throw new NotFoundException('Usuario no encontrado')
      }

      this.logger.debug(`Usuario a eliminar: ${JSON.stringify(foundUser)}`)

      // Verificar permisos
      if (user.role === UserRole.ADMIN) {
        this.logger.log(
          'ADMIN: Permiso concedido para eliminar cualquier usuario'
        )
      } else if (user.role === UserRole.COMPANY) {
        this.logger.log(
          `COMPANY: Verificando permisos para eliminar usuario de la compañía ${user.companyId}`
        )
        if (foundUser.companyId.toString() !== user.companyId.toString()) {
          this.logger.warn(
            `COMPANY: Intento de eliminar usuario de otra compañía. User companyId: ${user.companyId}, Found user companyId: ${foundUser.companyId}`
          )
          throw new ForbiddenException(
            'No tiene permisos para eliminar este usuario'
          )
        }
        if (foundUser.role === UserRole.ADMIN) {
          this.logger.warn('COMPANY: Intento de eliminar usuario ADMIN')
          throw new ForbiddenException(
            'No tiene permisos para eliminar usuarios ADMIN'
          )
        }
        this.logger.log('COMPANY: Permiso concedido para eliminar usuario')
      } else if (
        user.role === UserRole.PROVIDER &&
        foundUser.providerId === user.providerId
      ) {
        this.logger.log(
          'PROVIDER: Permiso concedido para eliminar su propio usuario'
        )
      } else {
        this.logger.warn(`Acceso denegado para el rol ${user.role}`)
        throw new ForbiddenException(
          'No tiene permisos para eliminar este usuario'
        )
      }

      await this.userModel.findByIdAndDelete(id)
      this.logger.log(`Usuario eliminado exitosamente: ${id}`)
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async assignRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return this.userModel.findByIdAndUpdate(
      id,
      { role: role },
      {
        new: true,
        runValidators: false,
      }
    )
  }

  async createProviderUser(userDto: any): Promise<UserDocument> {
    try {
      // Validar que no exista otro usuario con el mismo email
      const existingUser = await this.userModel.findOne({
        email: userDto.email,
      })
      if (existingUser) {
        throw new BadRequestException('El email ya está en uso')
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(userDto.password, 10)

      // Crear el usuario con rol PROVIDER
      const newUser = new this.userModel({
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        email: userDto.email,
        password: hashedPassword,
        role: UserRole.PROVIDER,
        companyId: userDto.companyId,
        providerId: userDto.providerId,
        isActive: true,
      })

      const savedUser = await newUser.save()

      // Enviar correo de bienvenida
      try {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL')
        await this.emailService.sendProviderWelcomeEmail(userDto.email, {
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          password: userDto.password, // Enviamos la contraseña sin encriptar para el correo
          loginUrl: `${frontendUrl}/auth/login`,
        })
        this.logger.log(`Correo de bienvenida enviado a ${userDto.email}`)
      } catch (error) {
        this.logger.error(
          `Error al enviar correo de bienvenida: ${error.message}`,
          error.stack
        )
        // No lanzamos el error para no interrumpir la creación del usuario
      }

      return savedUser
    } catch (error) {
      this.logger.error(
        `Error al crear proveedor: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario con ID: ${id}`)

      const user = await this.userModel.findById(id)
      if (!user) {
        this.logger.warn(`Usuario no encontrado para eliminar: ${id}`)
        throw new NotFoundException('Usuario no encontrado')
      }

      await this.userModel.findByIdAndDelete(id)
      this.logger.log(`Usuario eliminado exitosamente: ${id}`)
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findByRoleAndStatus(
    role: UserRole,
    isActive: boolean = true
  ): Promise<User[]> {
    try {
      this.logger.debug(
        `[DEBUG] Iniciando búsqueda de usuarios con rol ${role} y estado activo: ${isActive}`
      )

      // Log de la consulta que se va a ejecutar
      this.logger.debug(
        `[DEBUG] Ejecutando consulta: { role: ${role}, isActive: ${isActive} }`
      )

      const users = await this.userModel
        .find({ role, isActive })
        .select('-password')
        .exec()

      // Log detallado de los usuarios encontrados
      this.logger.debug(
        `[DEBUG] Usuarios encontrados: ${JSON.stringify(
          users.map(u => ({ id: u._id, email: u.email, role: u.role })),
          null,
          2
        )}`
      )

      this.logger.log(`Se encontraron ${users.length} usuarios con rol ${role}`)
      return users
    } catch (error) {
      this.logger.error(
        `Error al buscar usuarios por rol y estado: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
