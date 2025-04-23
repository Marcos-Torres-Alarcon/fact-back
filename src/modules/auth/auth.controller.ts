import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Body,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AuthGuard } from '@nestjs/passport'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { User, UserDocument, UserResponse } from '../users/entities/user.entity'
import { RolesGuard } from './guards/roles.guard'
import { Roles } from './decorators/roles.decorator'
import { UserRole } from '../users/enums/user-role.enum'
import { GetUser } from './decorators/get-user.decorator'
import { Request as ExpressRequest } from 'express'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/UserResponse' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
            token: { type: 'string' },
          },
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token JWT' })
  async validateToken(@Req() req: ExpressRequest) {
    return this.authService.validateToken(req)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  getProfile(@GetUser() user: UserDocument): UserResponse {
    const { password, ...userResponse } = user.toObject()
    return userResponse
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirección a Google',
  })
  async googleAuth(@Req() req) {
    // Este método no se ejecuta, la guard redirige a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback de autenticación con Google' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticación con Google exitosa',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/UserResponse' },
      },
    },
  })
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario obtenida exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
          },
        },
      },
    },
  })
  async getCurrentUser(@GetUser() user: UserResponse) {
    return {
      success: true,
      data: { user },
    }
  }
}
