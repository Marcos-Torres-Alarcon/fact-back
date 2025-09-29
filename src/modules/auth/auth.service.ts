import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from '../users/services/users.service'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from './dto/register.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument, UserResponse } from '../users/entities/user.entity'
import { ProviderDocument } from '../providers/entities/provider.entity'
import { LoginDto } from './dto/login.dto'
import { UserRole } from '../../shared/enums/role.enum'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { Logger } from '@nestjs/common'

interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  companyId?: string
}

interface GoogleUser {
  email: string
  firstName: string
  lastName: string
  picture?: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

  async register(
    registerDto: RegisterDto
  ): Promise<{ access_token: string; user: UserResponse }> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    })
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado')
    }

    if (registerDto.role === UserRole.COMPANY) {
      registerDto.companyId = new Types.ObjectId().toString()
    }

    const user = await this.usersService.create(
      {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: registerDto.password,
        role: registerDto.role,
        companyId: registerDto.companyId,
        isActive: true,
        userId: new Types.ObjectId().toString(),
      },
      registerDto.companyId
    )

    const token = this.generateToken(user)

    const { password, ...userResponse } = user.toObject()
    return {
      access_token: token,
      user: userResponse,
    }
  }

  async login(userData: LoginDto) {
    const user = await this.validateUser(userData.email, userData.password)
    if (!user) {
      throw new BadRequestException('Credenciales inválidas')
    }
    const token = this.generateToken(user)
    return {
      access_token: token,
      ...user,
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  private generateToken(user: UserDocument | ProviderDocument): string {
    try {
      this.logger.debug(`Generando token para usuario/proveedor: ${user.email}`)
      this.logger.debug(
        `Datos del usuario/proveedor: ${JSON.stringify({
          _id: user._id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        })}`
      )

      const payload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role as UserRole,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId ? user.companyId.toString() : null,
      }

      this.logger.debug(`Payload del token: ${JSON.stringify(payload)}`)

      const token = this.jwtService.sign(payload)
      this.logger.debug(`Token generado exitosamente`)

      return token
    } catch (error) {
      this.logger.error(`Error al generar token: ${error.message}`, error.stack)
      throw error
    }
  }

  async validateToken(req: any): Promise<UserResponse> {
    const user = req.user
    if (!user) {
      throw new UnauthorizedException('Token inválido')
    }
    const { password, ...userResponse } = user.toObject()
    return userResponse
  }

  async googleLogin(
    req: Request
  ): Promise<{ access_token: string; user: UserResponse }> {
    if (!req.user) {
      throw new UnauthorizedException('No se pudo autenticar con Google')
    }

    const googleUser = req.user as GoogleUser

    let user = await this.userModel.findOne({ email: googleUser.email })

    if (!user) {
      const newUser = await this.usersService.create(
        {
          userId: new Types.ObjectId().toString(),
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          email: googleUser.email,
          password: uuidv4(),
          role: UserRole.USER,
          isActive: true,
        },
        null
      )
      user = newUser
    } else if (!user.isActive) {
      throw new ForbiddenException('La cuenta está desactivada')
    }

    const token = this.generateToken(user)
    const { password, ...userResponse } = user.toObject()

    return {
      access_token: token,
      user: userResponse,
    }
  }
}
