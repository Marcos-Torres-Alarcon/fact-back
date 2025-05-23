import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
// import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth } from '@nestjs/swagger'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '../../../shared/enums/role.enum'

@Injectable()
@ApiBearerAuth()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    if (!user) {
      console.warn('[RolesGuard] No hay usuario en el request')
      return false
    }

    const result = requiredRoles.includes(user.role)
    if (!result) {
      console.warn(
        `[RolesGuard] Acceso denegado. Roles requeridos: ${requiredRoles.join(', ')} | Rol del usuario: ${user.role}`
      )
    }
    return result
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
