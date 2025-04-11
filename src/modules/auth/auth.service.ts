import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from '../users/services/users.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from './dto/register.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument, UserResponse } from '../users/entities/user.entity'
import { LoginDto } from './dto/login.dto'
import { UserRole } from '../users/enums/user-role.enum'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: UserResponse }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email: registerDto.email })
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado')
    }

    // Forzar el rol USER
    registerDto.role = UserRole.USER;

    // Crear el usuario
    const user = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      role: UserRole.USER,
      isActive: true,
      userId: new Types.ObjectId().toString()
    });

    // Generar token
    const token = this.generateToken(user);

    const { password, ...userResponse } = user.toObject();
    return {
      access_token: token,
      user: userResponse
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: UserResponse }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenException('La cuenta está desactivada');
    }

    const token = this.generateToken(user);
    const { password, ...userResponse } = user.toObject();

    return {
      access_token: token,
      user: userResponse
    };
  }

  private generateToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateToken(req: any): Promise<UserResponse> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    const { password, ...userResponse } = user.toObject();
    return userResponse;
  }

  async googleLogin(req: Request): Promise<{ access_token: string; user: UserResponse }> {
    if (!req.user) {
      throw new UnauthorizedException('No se pudo autenticar con Google');
    }

    const googleUser = req.user as GoogleUser;
    
    // Buscar usuario existente
    let user = await this.userModel.findOne({ email: googleUser.email });

    if (!user) {
      // Crear nuevo usuario si no existe
      const newUser = await this.usersService.create({
        _id: uuidv4(),
        userId: new Types.ObjectId().toString(),
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        password: uuidv4(), // Contraseña aleatoria
        role: UserRole.USER,
        isActive: true
      });
      user = newUser;
    } else if (!user.isActive) {
      throw new ForbiddenException('La cuenta está desactivada');
    }

    const token = this.generateToken(user);
    const { password, ...userResponse } = user.toObject();

    return {
      access_token: token,
      user: userResponse
    };
  }
}
