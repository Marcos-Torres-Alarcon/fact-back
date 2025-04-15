import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../../users/entities/user.entity'
import { Logger } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name)

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    try {
      this.logger.log(`Validando token para usuario: ${payload.sub}`)
      const user = await this.userModel.findOne({ _id: payload.sub })

      if (!user) {
        this.logger.warn(`Usuario no encontrado: ${payload.sub}`)
        throw new UnauthorizedException('Usuario no encontrado')
      }

      if (!user.isActive) {
        this.logger.warn(`Usuario inactivo: ${payload.sub}`)
        throw new UnauthorizedException('Usuario inactivo')
      }

      // Si el usuario es COMPANY y no tiene companyId, asignar su propio ID
      if (user.role === 'COMPANY' && !user.companyId) {
        this.logger.debug(`Asignando companyId al usuario COMPANY: ${user._id}`)
        user.companyId = user._id.toString()
        await user.save()
      }

      this.logger.log(`Token validado exitosamente para usuario: ${user.email}`)
      this.logger.debug(
        `Datos del usuario: ${JSON.stringify({
          _id: user._id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        })}`
      )

      return {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId ? user.companyId.toString() : null,
      }
    } catch (error) {
      this.logger.error(`Error al validar token: ${error.message}`, error.stack)
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}
