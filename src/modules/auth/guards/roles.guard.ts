import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/modules/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    console.log(request);
    const user = request.user as IUser;

    // Verifica si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some(role => user.roles.includes(role));
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
