import { Document } from 'mongoose'
import { PurchaseOrder } from '../entities/purchase-order.entity'
import { UserRole } from '../../users/enums/user-role.enum'

export interface RequestUser {
  _id: string
  role: UserRole
  companyId?: string
  providerId?: string
}

export interface PopulatedProvider {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  taxId: string
  companyId: string
  isActive: boolean
}

export type PurchaseOrderDocument = Document & PurchaseOrder
export type PurchaseOrderWithProvider = PurchaseOrderDocument & {
  provider: PopulatedProvider
} 