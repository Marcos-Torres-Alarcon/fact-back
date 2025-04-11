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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Intentando crear usuario con email: ${createUserDto.email}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({ email: createUserDto.email })
      if (existingUser) {
        this.logger.warn(`Intento de crear usuario con email existente: ${createUserDto.email}`);
        throw new BadRequestException('El correo electrónico ya está registrado')
      }

      // Encriptar contraseña si se proporciona
      if (createUserDto.password) {
        this.logger.log('Encriptando contraseña del usuario');
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10)
      }

      // Crear usuario
      const user = new this.userModel(createUserDto)
      const savedUser = await user.save()
      this.logger.log(`Usuario creado exitosamente con ID: ${savedUser._id}`);
      return savedUser
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(user: any): Promise<User[]> {
    try {
      this.logger.log(`Obteniendo usuarios para rol: ${user.role}`);
      
      // Si es ADMIN, puede ver todos los usuarios
      if (user.role === UserRole.ADMIN) {
        const users = await this.userModel.find().select('-password')
        this.logger.log(`ADMIN: Se encontraron ${users.length} usuarios`);
        return users
      }

      // Si es COMPANY, solo puede ver usuarios de su compañía
      if (user.role === UserRole.COMPANY) {
        const users = await this.userModel.find({ createdBy: user.userId }).select('-password')
        this.logger.log(`COMPANY: Se encontraron ${users.length} usuarios para la compañía ${user.userId}`);
        return users
      }

      // Si es PROVIDER, solo puede ver usuarios de su proveedor
      if (user.role === UserRole.PROVIDER) {
        const users = await this.userModel.find({ providerId: user.userId }).select('-password')
        this.logger.log(`PROVIDER: Se encontraron ${users.length} usuarios para el proveedor ${user.userId}`);
        return users
      }

      this.logger.warn(`Rol no autorizado para ver usuarios: ${user.role}`);
      throw new ForbiddenException('No tiene permisos para ver usuarios')
    } catch (error) {
      this.logger.error(`Error al obtener usuarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, user: any): Promise<User> {
    try {
      this.logger.log(`Buscando usuario con ID: ${id}`);
      
      const foundUser = await this.userModel.findById(id).select('-password')
      if (!foundUser) {
        this.logger.warn(`Usuario no encontrado con ID: ${id}`);
        throw new NotFoundException('Usuario no encontrado')
      }

      // Verificar permisos
      if (user.role === UserRole.ADMIN) {
        this.logger.log(`ADMIN: Acceso permitido al usuario ${id}`);
        return foundUser
      }

      if (user.role === UserRole.COMPANY && foundUser.createdBy === user.userId) {
        this.logger.log(`COMPANY: Acceso permitido al usuario ${id}`);
        return foundUser
      }

      if (user.role === UserRole.PROVIDER && foundUser.providerId === user.userId) {
        this.logger.log(`PROVIDER: Acceso permitido al usuario ${id}`);
        return foundUser
      }

      this.logger.warn(`Acceso denegado al usuario ${id} para el rol ${user.role}`);
      throw new ForbiddenException('No tiene permisos para ver este usuario')
    } catch (error) {
      this.logger.error(`Error al obtener usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Buscando usuario por email: ${email}`);
      const user = await this.userModel.findOne({ email }).select('-password')
      if (!user) {
        this.logger.warn(`Usuario no encontrado con email: ${email}`);
        throw new NotFoundException('Usuario no encontrado')
      }
      this.logger.log(`Usuario encontrado con email: ${email}`);
      return user
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<User> {
    try {
      this.logger.log(`Actualizando usuario con ID: ${id}`);
      
      const existingUser = await this.userModel.findById(id)
      if (!existingUser) {
        this.logger.warn(`Usuario no encontrado para actualizar: ${id}`);
        throw new NotFoundException('Usuario no encontrado')
      }

      // Verificar permisos
      if (user.role !== UserRole.ADMIN && existingUser.createdBy !== user.userId) {
        this.logger.warn(`Acceso denegado para actualizar usuario ${id}`);
        throw new ForbiddenException('No tiene permisos para actualizar este usuario')
      }

      // Encriptar contraseña si se proporciona
      if (updateUserDto.password) {
        this.logger.log('Encriptando nueva contraseña');
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
      
      this.logger.log(`Usuario actualizado exitosamente: ${id}`);
      return updatedUser
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    try {
      this.logger.log(`Actualizando rol del usuario ${id} a ${role}`);
      
      const user = await this.userModel.findById(id)
      if (!user) {
        this.logger.warn(`Usuario no encontrado para actualizar rol: ${id}`);
        throw new NotFoundException('Usuario no encontrado')
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { role }, { new: true })
        .select('-password')
      
      this.logger.log(`Rol de usuario actualizado exitosamente: ${id}`);
      return updatedUser
    } catch (error) {
      this.logger.error(`Error al actualizar rol de usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    try {
      this.logger.log(`Actualizando estado del usuario ${id} a ${isActive}`);
      
      const user = await this.userModel.findById(id)
      if (!user) {
        this.logger.warn(`Usuario no encontrado para actualizar estado: ${id}`);
        throw new NotFoundException('Usuario no encontrado')
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { isActive }, { new: true })
        .select('-password')
      
      this.logger.log(`Estado de usuario actualizado exitosamente: ${id}`);
      return updatedUser
    } catch (error) {
      this.logger.error(`Error al actualizar estado de usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, user: any): Promise<void> {
    try {
      this.logger.log(`Intentando eliminar usuario: ${id}`);
      
      const existingUser = await this.userModel.findById(id)
      if (!existingUser) {
        this.logger.warn(`Usuario no encontrado para eliminar: ${id}`);
        throw new NotFoundException('Usuario no encontrado')
      }

      // Verificar permisos
      if (user.role !== UserRole.ADMIN && existingUser.createdBy !== user.userId) {
        this.logger.warn(`Acceso denegado para eliminar usuario ${id}`);
        throw new ForbiddenException('No tiene permisos para eliminar este usuario')
      }

      await this.userModel.findByIdAndDelete(id)
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assignRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    return this.userModel.findByIdAndUpdate(
      id,
      { role: role },
      { 
        new: true,
        runValidators: false
      }
    )
  }

  async createProviderUser(userDto: any): Promise<UserDocument> {
    // Validar que no exista otro usuario con el mismo email
    const existingUser = await this.userModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new BadRequestException('El email ya está en uso');
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    
    // Crear el usuario con rol PROVIDER
    const newUser = new this.userModel({
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password: hashedPassword,
      role: UserRole.PROVIDER,
      companyId: userDto.companyId,
      providerId: userDto.providerId,
      isActive: true
    });
    
    return newUser.save();
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario con ID: ${id}`);
      
      const user = await this.userModel.findById(id);
      if (!user) {
        this.logger.warn(`Usuario no encontrado para eliminar: ${id}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.userModel.findByIdAndDelete(id);
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }
}
