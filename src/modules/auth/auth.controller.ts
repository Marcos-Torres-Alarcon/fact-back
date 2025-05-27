import {
  Controller,
  Post,
  UseGuards,
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
import { UserDocument, UserResponse } from '../users/entities/user.entity'
import { GetUser } from './decorators/get-user.decorator'
import { Request as ExpressRequest } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: ExpressRequest) {
    return this.authService.validateToken(req)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: UserDocument): UserResponse {
    const { password, ...userResponse } = user.toObject()
    return userResponse
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: UserResponse) {
    return {
      success: true,
      data: { user },
    }
  }
}
