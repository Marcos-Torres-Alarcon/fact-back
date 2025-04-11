import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProviderService } from '../modules/provider/provider.service';
import { UserRole } from '../modules/auth/enums/user-role.enum';
import { ProvidersService } from '../modules/providers/providers.service';

@Injectable()
export class CompanyOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(CompanyOwnershipGuard.name);
  
  constructor(
    private reflector: Reflector,
    private providerService: ProviderService,
    private providersService: ProvidersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Admin siempre tiene acceso
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    // Solo permitir acceso a COMPANY a sus propios recursos
    if (user.role === UserRole.COMPANY) {
      const providerId = request.params.id || request.body.providerId;
      
      if (!providerId) {
        return false;
      }
      
      if (!user.companyId) {
        this.logger.warn(`Usuario COMPANY sin companyId: ${user.userId}`);
        throw new ForbiddenException('Usuario sin empresa asignada');
      }
      
      try {
        const provider = await this.providersService.findOne(providerId);
        
        if (!provider.companyId) {
          this.logger.warn(`Proveedor sin empresa asignada: ${providerId}`);
          return false;
        }
        
        // Verificar que el proveedor pertenece a la compañía del usuario
        // Convertir ambos a string para comparación segura
        const providerCompanyId = String(provider.companyId);
        const userCompanyId = String(user.companyId);
        
        const hasAccess = providerCompanyId === userCompanyId;
        
        if (!hasAccess) {
          this.logger.warn(`Intento de acceso no autorizado: Usuario de compañía ${userCompanyId} intentó acceder al proveedor ${providerId} que pertenece a la compañía ${providerCompanyId}`);
        }
        
        return hasAccess;
      } catch (error) {
        this.logger.error(`Error al verificar propiedad: ${error.message}`);
        throw new ForbiddenException('No tienes acceso a este recurso');
      }
    }
    
    if (user.role === UserRole.PROVIDER && user.providerId) {
      const providerId = request.params.id;
      // Proveedor solo puede acceder a su propia información
      return providerId === user.providerId;
    }
    
    return false;
  }
} 