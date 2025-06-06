import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument, UserResponse } from '../entities/user.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import * as bcrypt from 'bcrypt'
import { UserRole } from '../../../shared/enums/role.enum'
import { EmailService } from '../../email/email.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async create(
    createUserDto: CreateUserDto,
    companyId: string
  ): Promise<UserDocument> {
    try {
      this.logger.log(
        `Intentando crear usuario: ${JSON.stringify(createUserDto)}`
      )

      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
        companyId,
      })
      if (existingUser) {
        this.logger.warn(`Usuario con email ${createUserDto.email} ya existe`)
        throw new BadRequestException('El email ya está registrado')
      }

      if (createUserDto.role === UserRole.COMPANY && !createUserDto.companyId) {
        this.logger.warn('Se requiere companyId para usuarios de tipo COMPANY')
        throw new BadRequestException(
          'Se requiere companyId para usuarios de tipo COMPANY'
        )
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        companyId,
      }

      this.logger.debug(
        `Datos del usuario a crear: ${JSON.stringify(userData)}`
      )

      const createdUser = new this.userModel(userData)
      const result = await createdUser.save()

      if (createUserDto.role === UserRole.PROVIDER) {
        try {
          const frontendUrl = this.configService.get<string>('FRONTEND_URL')
          await this.emailService.sendProviderWelcomeEmail(
            createUserDto.email,
            {
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              password: createUserDto.password,
              loginUrl: `${frontendUrl}/auth/login`,
            }
          )
        } catch (error) {
          this.logger.error(
            `Error al enviar correo de bienvenida al proveedor: ${error.message}`,
            error.stack
          )
        }
      }

      this.logger.log(`Usuario creado exitosamente con ID: ${result._id}`)
      this.logger.debug(
        `Datos del usuario creado: ${JSON.stringify({
          _id: result._id,
          email: result.email,
          role: result.role,
          companyId: result.companyId,
        })}`
      )

      return result
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack)
      throw error
    }
  }

  async findAll(companyId: string): Promise<UserDocument[]> {
    try {
      this.logger.log(
        `Obteniendo todos los usuarios para companyId: ${companyId}`
      )

      const totalUsers = await this.userModel.countDocuments().exec()
      this.logger.log(`Total de usuarios en la base de datos: ${totalUsers}`)

      const users = await this.userModel.find({ companyId }).exec()

      this.logger.log(
        `Usuarios encontrados para companyId ${companyId}: ${users.length}`
      )

      return users
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findAllUsers(): Promise<UserDocument[]> {
    try {
      this.logger.log('Obteniendo todos los usuarios sin filtro de companyId')

      const users = await this.userModel.find({}).exec()

      this.logger.log(`Total de usuarios encontrados: ${users.length}`)

      return users
    } catch (error) {
      this.logger.error(
        `Error al obtener todos los usuarios: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findOne(id: string): Promise<UserDocument> {
    try {
      this.logger.log(`Buscando usuario con ID: ${id}`)
      const user = await this.userModel.findOne({ _id: id }).exec()
      if (!user) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`)
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`)
      }
      return user
    } catch (error) {
      this.logger.error(
        `Error al buscar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      this.logger.log(`Buscando usuario con email: ${email}`)
      const user = await this.userModel.findOne({ email }).exec()
      if (!user) {
        this.logger.warn(`Usuario con email ${email} no encontrado`)
        throw new NotFoundException(`Usuario con email ${email} no encontrado`)
      }
      return user.toObject()
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
    companyId: string
  ): Promise<UserDocument> {
    try {
      this.logger.log(`Actualizando usuario con ID: ${id}`)

      if (updateUserDto.role === UserRole.COMPANY && !updateUserDto.companyId) {
        this.logger.warn('Se requiere companyId para usuarios de tipo COMPANY')
        throw new BadRequestException(
          'Se requiere companyId para usuarios de tipo COMPANY'
        )
      }

      if (updateUserDto.role === UserRole.COMPANY) {
        throw new ForbiddenException(
          'You can only update users from your company'
        )
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
      }

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: id, companyId },
          { $set: updateUserDto },
          { new: true }
        )
        .exec()

      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado')
      }

      this.logger.log(`Usuario actualizado exitosamente: ${id}`)
      this.logger.debug(
        `Datos del usuario actualizado: ${JSON.stringify({
          _id: updatedUser._id,
          email: updatedUser.email,
          role: updatedUser.role,
          companyId: updatedUser.companyId,
        })}`
      )

      return updatedUser
    } catch (error) {
      this.logger.error(
        `Error al actualizar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async remove(id: string, companyId: string): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario con ID: ${id}`)

      const result = await this.userModel
        .findOneAndDelete({ _id: id, companyId })
        .exec()
      if (!result) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`)
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`)
      }
      this.logger.log(`Usuario eliminado exitosamente: ${id}`)
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
