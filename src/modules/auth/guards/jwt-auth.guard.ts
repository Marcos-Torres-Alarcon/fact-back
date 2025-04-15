import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error(`Error de autenticación: ${err?.message || info?.message}`);
      throw new UnauthorizedException('No autorizado');
    }
    return user;
  }
}
