import { Document } from 'mongoose'
import { CommonStatus } from '../enums/status.enum'
import { UserRole } from '../enums/role.enum'

export interface IProviderBase {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  address: string
  taxId: string
  products: string[]
  status: CommonStatus
  role: UserRole
  companyId: string
  isActive: boolean
}

export interface IProvider extends IProviderBase, Document {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export type CreateProviderDTO = Omit<IProviderBase, 'password'> & {
  password: string
}

export type UpdateProviderDTO = Partial<CreateProviderDTO>
