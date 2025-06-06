import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from '../constants/jwt.constants'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  async validate(payload: any) {
    return {
      _id: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role || (payload.roles && payload.roles[0]),
      roles: payload.roles || [payload.role],
      companyId: payload.companyId,
      firstName: payload.firstName,
      lastName: payload.lastName,
    }
  }
}
