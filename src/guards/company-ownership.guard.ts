import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { UserRole } from '../modules/auth/enums/user-role.enum'
import { ProvidersService } from '../modules/providers/providers.service'

@Injectable()
export class CompanyOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(CompanyOwnershipGuard.name)

  constructor(private providersService: ProvidersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (user.role === UserRole.ADMIN) {
      return true
    }

    if (user.role === UserRole.COMPANY) {
      const providerId = request.params.id || request.body.providerId

      if (!providerId) {
        return false
      }

      if (!user.companyId) {
        this.logger.warn(`Usuario COMPANY sin companyId: ${user.userId}`)
        throw new ForbiddenException('Usuario sin empresa asignada')
      }

      try {
        const provider = await this.providersService.findById(
          providerId,
          user.companyId
        )

        if (!provider.companyId) {
          this.logger.warn(`Proveedor sin empresa asignada: ${providerId}`)
          return false
        }

        const providerCompanyId = String(provider.companyId)
        const userCompanyId = String(user.companyId)

        const hasAccess = providerCompanyId === userCompanyId

        if (!hasAccess) {
          this.logger.warn(
            `Intento de acceso no autorizado: Usuario de compañía ${userCompanyId} intentó acceder al proveedor ${providerId} que pertenece a la compañía ${providerCompanyId}`
          )
        }

        return hasAccess
      } catch (error) {
        this.logger.error(`Error al verificar propiedad: ${error.message}`)
        throw new ForbiddenException('No tienes acceso a este recurso')
      }
    }

    if (user.role === UserRole.PROVIDER && user.providerId) {
      const providerId = request.params.id
      return providerId === user.providerId
    }

    return false
  }
}
