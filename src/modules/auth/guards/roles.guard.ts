import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IUser } from '../interfaces/user.interface'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    )
    if (!requiredRoles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user as IUser
    return requiredRoles.some(role => user.roles.includes(role))
  }
}
