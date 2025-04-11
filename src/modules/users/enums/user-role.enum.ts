import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
  PROVIDER = 'PROVIDER',
  USER = 'USER'
}

// Documentación para Swagger
export const UserRoleDescription = {
  ADMIN: 'Administrador del sistema',
  COMPANY: 'Usuario de compañía',
  PROVIDER: 'Proveedor',
  USER: 'Usuario básico'
}; 