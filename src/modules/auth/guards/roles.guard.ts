import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
// import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../users/enums/user-role.enum'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
@ApiBearerAuth()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    if (!user) {
      return false
    }

    return requiredRoles.includes(user.role)
  }

  //   const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
  //     context.getHandler(),
  //     context.getClass(),
  //   ]);

  //   if (!requiredRoles) {
  //     return true;
  //   }

  //   const request = context.switchToHttp().getRequest();
  //   const token = request.headers.authorization?.split(' ')[1];

  //   if (!token) return false;

  //   try {
  //     const decoded = this.jwtService.verify(token);
  //     console.log(decoded);
  //     return requiredRoles.includes(decoded.roleId.name);
  //   } catch (err) {
  //     return false;
  //   }
  // }
}
