export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
  PROVIDER = 'PROVIDER',
  ACCOUNTING = 'ACCOUNTING',
  TREASURY = 'TREASURY',
  USER = 'USER',
}

// Documentación para Swagger
export const UserRoleDescription = {
  ADMIN: 'Administrador del sistema',
  COMPANY: 'Usuario de compañía',
  PROVIDER: 'Proveedor',
  ACCOUNTING: 'Contabilidad',
  TREASURY: 'Tesorería',
  USER: 'Usuario básico',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COMPANY]: 'Empresa',
  [UserRole.PROVIDER]: 'Proveedor',
  [UserRole.ACCOUNTING]: 'Contabilidad',
  [UserRole.TREASURY]: 'Tesorería',
  [UserRole.USER]: 'Usuario',
}
