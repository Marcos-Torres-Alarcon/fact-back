import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../../../shared/enums/role.enum'

// Documentación para Swagger
export const UserRoleDescription = {
  ADMIN: 'Administrador del sistema',
  ADMIN2: 'Administrador 2',
  COMPANY: 'Usuario de compañía',
  PROVIDER: 'Proveedor',
  ACCOUNTING: 'Contabilidad',
  TREASURY: 'Tesorería',
  USER: 'Usuario básico',
  COLABORADOR: 'Colaborador',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.ADMIN2]: 'Administrador 2',
  [UserRole.COMPANY]: 'Empresa',
  [UserRole.PROVIDER]: 'Proveedor',
  [UserRole.ACCOUNTING]: 'Contabilidad',
  [UserRole.TREASURY]: 'Tesorería',
  [UserRole.USER]: 'Usuario',
  [UserRole.COLABORADOR]: 'Colaborador',
}
