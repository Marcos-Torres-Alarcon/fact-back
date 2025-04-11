import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument, UserResponse } from '../entities/user.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      this.logger.log(`Intentando crear usuario: ${JSON.stringify(createUserDto)}`);
      
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        this.logger.warn(`Usuario con email ${createUserDto.email} ya existe`);
        throw new BadRequestException('El email ya está registrado');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const userData = {
        ...createUserDto,
        password: hashedPassword
      };

      const createdUser = new this.userModel(userData);
      const result = await createdUser.save();
      
      this.logger.log(`Usuario creado exitosamente con ID: ${result._id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      this.logger.log('Obteniendo todos los usuarios');
      return await this.userModel.find().exec();
    } catch (error) {
      this.logger.error(`Error al obtener usuarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserDocument> {
    try {
      this.logger.log(`Buscando usuario con ID: ${id}`);
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      this.logger.log(`Buscando usuario con email: ${email}`);
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        this.logger.warn(`Usuario con email ${email} no encontrado`);
        throw new NotFoundException(`Usuario con email ${email} no encontrado`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    try {
      this.logger.log(`Actualizando usuario con ID: ${id}`);
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateUserDto },
        { new: true }
      ).exec();

      this.logger.log(`Usuario actualizado exitosamente: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario con ID: ${id}`);
      const result = await this.userModel.findByIdAndDelete(id).exec();
      if (!result) {
        this.logger.warn(`Usuario con ID ${id} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }
} 